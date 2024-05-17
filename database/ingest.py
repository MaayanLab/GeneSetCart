import pandas as pd
import psycopg2
import os
from dotenv import load_dotenv
from tqdm import tqdm
import uuid
import math
import urllib.request
import s3fs

load_dotenv()
DATABASE_URL = os.environ.get('DATABASE_URL')
assert DATABASE_URL is not None, 'Missing DATABASE_URL environment variable to connect to the database'
# connect to db
conn = psycopg2.connect(DATABASE_URL)
# Open a cursor to perform database operations
cur = conn.cursor()

# #Ingest NCBI genes
s3_endpoint = 'https://' + os.environ.get('S3_ENDPOINT') + '/'
s3 = s3fs.S3FileSystem(anon=True, client_kwargs={'endpoint_url': s3_endpoint })
s3_bucket = os.environ.get('S3_BUCKET')
gene_info_file = f'{s3_bucket}/Homo_sapiens.gene_info'
genes_info =  pd.read_csv(s3.open(gene_info_file), index_col=0, sep="\t")
for index, row in tqdm(genes_info.iterrows(), total=genes_info.shape[0]):
    cur.execute('''INSERT INTO genes (id, description, gene_symbol, synonyms) 
                    VALUES  (%s, %s, %s, %s)
                    ON CONFLICT (id)
                    DO NOTHING;''', (row['GeneID'], row['description'], row['Symbol'], row['Synonyms']))
conn.commit()


#Ingest abstract templates
library_abstracts_file = f'{s3_bucket}/library_abstracts.csv'
library_abstracts = pd.read_csv(s3.open(library_abstracts_file))
for index, row in library_abstracts.iterrows():
    cur.execute('''INSERT INTO lib_abstracts (id, lib, abstract) 
                    VALUES  (%s, %s, %s)
                    ON CONFLICT (lib) 
                    DO UPDATE 
                    SET 
                    abstract=EXCLUDED.abstract;''', (str(uuid.uuid4()), row['Library'], row['Descriptions']))
    conn.commit()


# ingest all GMT data
cfde_genesets_file = f'{s3_bucket}/CFDE Genesets.tsv'
cfde_genesets = pd.read_csv(s3.open(cfde_genesets_file), sep='\t')
CFDE_geneset_df = pd.DataFrame([], columns=['Library', 'Geneset', 'Genes'])

# for each line, open with file link and populate database
data = []
for index, row in cfde_genesets.iterrows():
    with urllib.request.urlopen(row['Link']) as f:
        html = f.read().decode('utf-8') 
        for line in tqdm(html.split('\n'), total=len(html.split('\n'))):
            line_content = line.split('\t')
            geneset_name =  line_content[0]
            genes = line_content[1:]
            genes = [i for i in genes if i != '']
            if len(genes) > 0:
                data.append([row['Library'], geneset_name, genes])
                geneset_id = str(uuid.uuid4())
                cur.execute('''INSERT INTO cfde_genesets (id, term, library) 
                                            VALUES  (%s, %s, %s)
                                            ON CONFLICT (term, library) 
                                            DO NOTHING;''', (geneset_id, geneset_name, row['Library']))
                conn.commit()

            mask = genes_info['Symbol'].isin(genes)
            geneInfoFiltered = genes_info[mask]
            valid_gene_ids = geneInfoFiltered['GeneID'].to_list()
            table_name = "_GeneTocfdegeneset"
            cur.execute(f'''SELECT COUNT(id) FROM cfde_genesets WHERE  id='{geneset_id}';''')
            geneset_exists = cur.fetchone()[0] > 0
            if geneset_exists:
                for geneId in valid_gene_ids: 
                    cur.execute(f'''INSERT INTO "{table_name}"  ("A", "B") 
                                    VALUES  (%s, %s)
                                    ON CONFLICT ("A", "B")
                                    DO NOTHING;''', (geneId, geneset_id))
                    conn.commit()
CFDE_geneset_df = pd.DataFrame(data, columns=['Library', 'Geneset', 'Genes'])

#Ingest GMT crossing data
dataframe_names = ['GlyGen_Glycosylated_Proteins', 
 'GTEx_Aging_Sigs', 
 'GTEx_Tissues', 
 'IDG_Drug_Targets', 
 'KOMP2_Mouse_Phenotypes', 
 'LINCS_L1000_Chem_Pert_Consensus_Sigs', 
 'LINCS_L1000_CRISPR_KO_Consensus_Sigs',
 'MoTrPAC', 
 'Metabolomics_Workbench_Metabolites', 
 'HubMAP_Azimuth_2023_Augmented']

CFDE_Lib_Full = {
    "LINCS_L1000_Chem_Pert_Consensus_Sigs": "LINCS L1000 CMAP Chemical Pertubation Consensus Signatures",
    "LINCS_L1000_CRISPR_KO_Consensus_Sigs": "LINCS L1000 CMAP CRISPR Knockout Consensus Signatures",
    "GTEx_Tissues": 'GTEx Tissue Gene Expression Profiles',
    "GTEx_Aging_Sigs": 'GTEx Tissue-Specific Aging Signatures',
    "Metabolomics_Workbench_Metabolites": 'Metabolomics Gene-Metabolite Associations',
    "IDG_Drug_Targets": 'IDG Drug Targets',
    "GlyGen_Glycosylated_Proteins": 'Glygen Glycosylated Proteins',
    "KOMP2_Mouse_Phenotypes": 'KOMP2 Mouse Phenotypes',
    "MoTrPAC": 'MoTrPAC Rat Endurance Exercise Training',
    "HuBMAP": "Human BioMolecular Atlas Program Azimuth"
}

for lib in dataframe_names: 
    for inner_lib in dataframe_names:
        if not(lib == inner_lib):
            if not((lib == 'LINCS_L1000_Chem_Pert_Consensus_Sigs') or (lib == 'LINCS_L1000_CRISPR_KO_Consensus_Sigs')):
                if not((inner_lib == 'LINCS_L1000_Chem_Pert_Consensus_Sigs') or (inner_lib == 'LINCS_L1000_CRISPR_KO_Consensus_Sigs')):
                    try:
                        crossed_dataframe_file = f'{s3_bucket}/crossed_sets/{lib}_{inner_lib}_crossing_data.csv'
                        crossed_dataframe = pd.read_csv(s3.open(crossed_dataframe_file), index_col=0)
                        filtered_dataframe = crossed_dataframe[crossed_dataframe['P-value'] < 0.001].iloc[:5000]
                        for index, row in tqdm(filtered_dataframe.iterrows(), total=filtered_dataframe.shape[0]):
                            n_genes1 = len(CFDE_geneset_df.loc[(CFDE_geneset_df['Geneset'] == row['Geneset_1']) & (CFDE_geneset_df['Library'] == CFDE_Lib_Full[row['Lib1']])]['Genes'].item())
                            n_genes2 = len(CFDE_geneset_df.loc[(CFDE_geneset_df['Geneset'] == row['Geneset_2'])  & (CFDE_geneset_df['Library'] == CFDE_Lib_Full[row['Lib2']])]['Genes'].item())
                            if row['Odds_Ratio'] == math.inf:
                                row['Odds_Ratio'] = 999999999999999.99
                            cur.execute('''INSERT INTO cfde_cross_pair (id, lib_1, lib_2, geneset_1, geneset_2, odds_ratio, pvalue, n_overlap, overlap, n_genes1, n_genes2) 
                                            VALUES  (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                                            ON CONFLICT (lib_1, lib_2, geneset_1, geneset_2) 
                                            DO UPDATE 
                                            SET 
                                            odds_ratio=EXCLUDED.odds_ratio,
                                            pvalue=EXCLUDED.pvalue,
                                            n_overlap=EXCLUDED.n_overlap,
                                            overlap=EXCLUDED.overlap,
                                            n_genes1=EXCLUDED.n_genes1,
                                            n_genes2=EXCLUDED.n_genes2;''', (str(uuid.uuid4()), row['Lib1'], row['Lib2'], row['Geneset_1'], row['Geneset_2'], row['Odds_Ratio'], row['P-value'], row['n_Overlap'], row['Overlap'].strip('][').split(', '), n_genes1, n_genes2))
                            conn.commit()
                    except Exception as e: print(e)


# Ingest LINCS Crossing Data
for lib in dataframe_names: 
    for inner_lib in dataframe_names:
        if not(lib == inner_lib):
            if (lib == 'LINCS_L1000_Chem_Pert_Consensus_Sigs') or (lib == 'LINCS_L1000_CRISPR_KO_Consensus_Sigs') or (inner_lib == 'LINCS_L1000_Chem_Pert_Consensus_Sigs') or (inner_lib == 'LINCS_L1000_CRISPR_KO_Consensus_Sigs'):
                try:
                    crossed_dataframe_file = f'{s3_bucket}/crossed_sets/LINCS Top Pairs/{lib}_{inner_lib}.csv'
                    crossed_dataframe = pd.read_csv(s3.open(crossed_dataframe_file), index_col=0)
                    filtered_dataframe = crossed_dataframe[crossed_dataframe['P-value'] < 0.001].iloc[:5000]
                    for index, row in tqdm(filtered_dataframe.iterrows(), total=filtered_dataframe.shape[0]):
                        n_genes1 = len(CFDE_geneset_df.loc[(CFDE_geneset_df['Geneset'] == row['Geneset_1']) & (CFDE_geneset_df['Library'] == CFDE_Lib_Full[row['Lib1']])]['Genes'].item())
                        n_genes2 = len(CFDE_geneset_df.loc[(CFDE_geneset_df['Geneset'] == row['Geneset_2'])  & (CFDE_geneset_df['Library'] == CFDE_Lib_Full[row['Lib2']])]['Genes'].item())
                        if row['Odds_Ratio'] == math.inf:
                            row['Odds_Ratio'] = 999999999999999.99
                        cur.execute('''INSERT INTO cfde_cross_pair (id, lib_1, lib_2, geneset_1, geneset_2, odds_ratio, pvalue, n_overlap, overlap, n_genes1, n_genes2) 
                                        VALUES  (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                                        ON CONFLICT (lib_1, lib_2, geneset_1, geneset_2) 
                                        DO UPDATE 
                                        SET 
                                        odds_ratio=EXCLUDED.odds_ratio,
                                        pvalue=EXCLUDED.pvalue,
                                        n_overlap=EXCLUDED.n_overlap,
                                        overlap=EXCLUDED.overlap,
                                        n_genes1=EXCLUDED.n_genes1,
                                        n_genes2=EXCLUDED.n_genes2;''', (str(uuid.uuid4()), row['Lib1'], row['Lib2'], row['Geneset_1'], row['Geneset_2'], row['Odds_Ratio'], row['P-value'], row['n_Overlap'], row['Overlap'].strip('][').split(', '), n_genes1, n_genes2))
                        conn.commit()
                except:
                    continue

conn.close()
cur.close()
