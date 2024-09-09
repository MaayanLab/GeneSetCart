import json
import pandas as pd
import psycopg2
import os
from dotenv import load_dotenv
from tqdm import tqdm
import uuid
import math
import urllib.request
import s3fs
from df2pg import OnConflictSpec, copy_from_records

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
genes_info =  pd.read_csv('https://minio.dev.maayanlab.cloud/' + gene_info_file, index_col=0, sep="\t")

copy_from_records(conn, 'genes', ['id', 'description', 'gene_symbol', 'synonyms'], (
  dict(id=row['GeneID'], description=row['description'], gene_symbol=row['Symbol'], synonyms=row['Synonyms'])
    for index, row in tqdm(genes_info.iterrows(), total=genes_info.shape[0])
), on=OnConflictSpec(conflict=("id",), update=('description', 'gene_symbol', 'synonyms')))

#Ingest abstract templates
library_abstracts_file = f'{s3_bucket}/library_abstracts.csv'
library_abstracts = pd.read_csv('https://minio.dev.maayanlab.cloud/'+library_abstracts_file)


copy_from_records(conn, 'lib_abstracts', ['id', 'lib', 'abstract'], (
  dict(id=str(uuid.uuid4()), lib=row['Library'], abstract=row['Descriptions'])
    for index, row in tqdm(library_abstracts.iterrows(), total=library_abstracts.shape[0])
), on=OnConflictSpec(conflict=("lib",), update=('abstract',)))

# ingest all GMT data
cfde_genesets_file = f'{s3_bucket}/CFDE%20Genesets.tsv'
cfde_genesets = pd.read_csv('https://minio.dev.maayanlab.cloud/' + cfde_genesets_file, sep='\t')

cur.execute('''DELETE FROM "_GeneTocfdegeneset";''')
cur.execute('''DELETE from cfde_genesets;''')
conn.commit()

# for each line, open with file link and populate database
data = []
gene_data = []
for index, row in cfde_genesets.iterrows():
    with urllib.request.urlopen(row['Link']) as f:
        html = f.read().decode('utf-8') 
        for line in tqdm(html.split('\n'), total=len(html.split('\n'))):
            line_content = line.split('\t')
            geneset_name =  line_content[0]
            genes = line_content[1:]
            genes = [i for i in genes if i != '']
            if len(genes) > 0:
                geneset_id = str(uuid.uuid4())
                data.append([geneset_id, row['Library'], geneset_name, genes])
            mask = genes_info['Symbol'].isin(genes)
            geneInfoFiltered = genes_info[mask]
            valid_gene_ids = geneInfoFiltered['GeneID'].to_list()
            for geneId in valid_gene_ids: 
                gene_data.append([geneId, geneset_id])
CFDE_geneset_df = pd.DataFrame(data, columns=['id', 'Library', 'Geneset', 'Genes'])
CFDE_gene_df= pd.DataFrame(gene_data, columns=['geneId', 'geneset_id'])
print(CFDE_geneset_df, CFDE_gene_df)

copy_from_records(conn, 'cfde_genesets', ['id', 'term', 'library'], (
  dict(id=row['id'], term=row['Geneset'], library=row['Library'])
    for index, row in tqdm(CFDE_geneset_df.iterrows(), total=CFDE_geneset_df.shape[0])
), on=OnConflictSpec(conflict=('term', 'library',), update=('id',)))

copy_from_records(conn, '"_GeneTocfdegeneset"', ['A', 'B'], (dict(A=row['geneId'], B=row['geneset_id'])
                                                             for index, row in tqdm(CFDE_gene_df.iterrows(), total=CFDE_gene_df.shape[0])), 
                                                             on=OnConflictSpec(conflict=('A', 'B',), update=()))


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
    "HubMAP_Azimuth_2023_Augmented": "Human BioMolecular Atlas Program Azimuth"
}

# delete old LINCS entries
cur.execute('''DELETE from cfde_cross_pair
WHERE lib_1 = 'LINCS_L1000_Chem_Pert_Consensus_Sigs' AND lib_2 = 'LINCS_L1000_CRISPR_KO_Consensus_Sigs';''')
conn.commit()

for lib in dataframe_names: 
    for inner_lib in dataframe_names:
        if not(lib == inner_lib):
            if not((lib == 'LINCS_L1000_Chem_Pert_Consensus_Sigs') or (lib == 'LINCS_L1000_CRISPR_KO_Consensus_Sigs')):
                if not((inner_lib == 'LINCS_L1000_Chem_Pert_Consensus_Sigs') or (inner_lib == 'LINCS_L1000_CRISPR_KO_Consensus_Sigs')):
                    try:
                        crossed_dataframe_file = f'{s3_bucket}/crossed_sets/{lib}_{inner_lib}_crossing_data.csv'
                        crossed_dataframe = pd.read_csv('https://minio.dev.maayanlab.cloud/' + crossed_dataframe_file, index_col=0)
                        
                        filtered_dataframe = crossed_dataframe[crossed_dataframe['P-value'] < 0.001].iloc[:5000]
                        print(crossed_dataframe)

                        copy_from_records(conn, 'cfde_cross_pair', ['id', 'lib_1', 'lib_2', 'geneset_1', 'geneset_2', 'odds_ratio', 'pvalue', 'n_overlap', 'overlap', 'n_genes1', 'n_genes2'], (
                        dict(id=str(uuid.uuid4()), 
                                lib_1=row['Lib1'], 
                                lib_2=row['Lib2'], 
                                geneset_1=row['Geneset_1'], 
                                geneset_2=row['Geneset_2'], 
                                odds_ratio=math.inf if row['Odds_Ratio'] == math.inf else row['Odds_Ratio'], 
                                pvalue=row['P-value'], 
                                n_overlap=row['n_Overlap'], 
                                overlap={item for item in row['Overlap'].strip('][').split(', ')}, 
                                n_genes1=len(CFDE_geneset_df.loc[(CFDE_geneset_df['Geneset'] == row['Geneset_1']) & (CFDE_geneset_df['Library'] == CFDE_Lib_Full[row['Lib1']])]['Genes'].item()), 
                                n_genes2=len(CFDE_geneset_df.loc[(CFDE_geneset_df['Geneset'] == row['Geneset_2'])  & (CFDE_geneset_df['Library'] == CFDE_Lib_Full[row['Lib2']])]['Genes'].item()))
                            for index, row in tqdm(filtered_dataframe.iterrows(), total=filtered_dataframe.shape[0])
                        ), on=OnConflictSpec(conflict=('lib_1', 'lib_2', 'geneset_1', 'geneset_2',), update=('odds_ratio', 'pvalue', 'n_overlap', 'overlap', 'n_genes1', 'n_genes2',)))

                    except Exception as e:
                        print(e)
                    


# Ingest LINCS Crossing Data
for lib in dataframe_names: 
    for inner_lib in dataframe_names:
        if not(lib == inner_lib):
            if (lib == 'LINCS_L1000_Chem_Pert_Consensus_Sigs') or (lib == 'LINCS_L1000_CRISPR_KO_Consensus_Sigs') or (inner_lib == 'LINCS_L1000_Chem_Pert_Consensus_Sigs') or (inner_lib == 'LINCS_L1000_CRISPR_KO_Consensus_Sigs'):
                try:
                    crossed_dataframe_file = f'{s3_bucket}/crossed_sets/LINCS Top Pairs/{lib}_{inner_lib}.csv'
                    crossed_dataframe = pd.read_csv('https://minio.dev.maayanlab.cloud/' + crossed_dataframe_file, index_col=0)
                    filtered_dataframe = crossed_dataframe[crossed_dataframe['P-value'] < 0.001].iloc[:5000]
                    copy_from_records(conn, 'cfde_cross_pair', ['id', 'lib_1', 'lib_2', 'geneset_1', 'geneset_2', 'odds_ratio', 'pvalue', 'n_overlap', 'overlap', 'n_genes1', 'n_genes2'], (
                        dict(id=str(uuid.uuid4()), 
                             lib_1=row['Lib1'], 
                             lib_2=row['Lib2'], 
                             geneset_1=row['Geneset_1'], 
                             geneset_2=row['Geneset_2'], 
                             odds_ratio=math.inf if row['Odds_Ratio'] == math.inf else row['Odds_Ratio'], 
                             pvalue=row['P-value'], 
                             n_overlap=row['n_Overlap'], 
                             overlap={item for item in row['Overlap'].strip('][').split(', ')},
                             n_genes1=len(CFDE_geneset_df.loc[(CFDE_geneset_df['Geneset'] == row['Geneset_1']) & (CFDE_geneset_df['Library'] == CFDE_Lib_Full[row['Lib1']])]['Genes'].item()), 
                             n_genes2=len(CFDE_geneset_df.loc[(CFDE_geneset_df['Geneset'] == row['Geneset_2'])  & (CFDE_geneset_df['Library'] == CFDE_Lib_Full[row['Lib2']])]['Genes'].item()))
                            for index, row in tqdm(filtered_dataframe.iterrows(), total=filtered_dataframe.shape[0])
                        ), on=OnConflictSpec(conflict=('lib_1', 'lib_2', 'geneset_1', 'geneset_2',), update=('odds_ratio', 'pvalue', 'n_overlap', 'overlap', 'n_genes1', 'n_genes2',)))
                except:
                    continue

conn.close()
cur.close()
