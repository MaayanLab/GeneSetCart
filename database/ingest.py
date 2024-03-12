import pandas as pd
import psycopg2
import os
from dotenv import load_dotenv
from tqdm import tqdm
import uuid
import math


load_dotenv()
DATABASE_URL = os.environ.get('DATABASE_URL')
assert DATABASE_URL is not None, 'Missing DATABASE_URL environment variable to connect to the database'
# connect to db
conn = psycopg2.connect(DATABASE_URL)
# Open a cursor to perform database operations
cur = conn.cursor()

#Ingest NCBI genes
cur.execute(
    '''CREATE TABLE IF NOT EXISTS genes (id VARCHAR, 
                                        description VARCHAR,
                                        gene_symbol VARCHAR, 
                                        synonyms VARCHAR )''')


genes_info = pd.read_table('Homo_sapiens.gene_info')
for index, row in tqdm(genes_info.iterrows(), total=genes_info.shape[0]):
    cur.execute('''INSERT INTO genes (id, description, gene_symbol, synonyms) 
                    VALUES  (%s, %s, %s, %s);''', (row['GeneID'], row['description'], row['Symbol'], row['Synonyms']))
conn.commit()


#Ingest abstract templates
library_abstracts = pd.read_csv('library_abstracts.csv')
for index, row in library_abstracts.iterrows():
    cur.execute('''INSERT INTO lib_abstracts (id, lib, abstract) 
                    VALUES  (%s, %s, %s);''', (str(uuid.uuid4()), row['Library'], row['Descriptions']))
    conn.commit()

#Ingest data crossing data
dataframe_names = ['GlyGen_Glycosylated_Proteins', 
 'GTEx_Aging_Sigs', 
 'GTEx_Tissues', 
 'IDG_Drug_Targets', 
 'KOMP2_Mouse_Phenotypes', 
 'LINCS_L1000_Chem_Pert_Consensus_Sigs', 
 'LINCS_L1000_CRISPR_KO_Consensus_Sigs',
 'MoTrPAC', 
 'Metabolomics_Workbench_Metabolites']

for lib in dataframe_names: 
    for inner_lib in dataframe_names:
        if not(lib == inner_lib):
            if not((lib == 'LINCS_L1000_Chem_Pert_Consensus_Sigs') or (lib == 'LINCS_L1000_CRISPR_KO_Consensus_Sigs')):
                if not((inner_lib == 'LINCS_L1000_Chem_Pert_Consensus_Sigs') or (inner_lib == 'LINCS_L1000_CRISPR_KO_Consensus_Sigs')):
                    try: 
                        crossed_dataframe = pd.read_csv('./crossed_sets/' + lib+ '_' + inner_lib + '_crossing_data.csv', index_col=0)
                        filtered_dataframe = crossed_dataframe[crossed_dataframe['P-value'] < 0.001]
                        for index, row in tqdm(filtered_dataframe.iterrows(), total=filtered_dataframe.shape[0]):
                            if row['Odds_Ratio'] == math.inf:
                                row['Odds_Ratio'] = 999999999999999.99
                            cur.execute('''INSERT INTO cfde_cross_pair (id, lib_1, lib_2, geneset_1, geneset_2, odds_ratio, pvalue, n_overlap, overlap) 
                                            VALUES  (%s, %s, %s, %s, %s, %s, %s, %s, %s);''', (str(uuid.uuid4()), row['Lib1'], row['Lib2'], row['Geneset_1'], row['Geneset_2'], row['Odds_Ratio'], row['P-value'], row['n_Overlap'], row['Overlap'].strip('][').split(', ')))
                            conn.commit()
                    except:
                        continue

conn.close()
cur.close()
