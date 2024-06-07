import pandas as pd
import psycopg2
import os
from dotenv import load_dotenv
from tqdm import tqdm
import uuid
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
contacts_info_file = f'{s3_bucket}/filtered-paper-contacts.csv'
contacts_info =  pd.read_csv(s3.open(contacts_info_file))
contacts_info = contacts_info.drop_duplicates(subset=['pmcid', 'email', 'article_title'])
copy_from_records(conn, 'paper_contacts', ['id', 'pmcid', 'article_title', 'surname', 'given_name', 'email'], (
  dict(id=str(uuid.uuid4()), pmcid=row['pmcid'], article_title=row['article_title'], surname=row['surname'], given_name=row['given_name'], email=row['email'])
    for index, row in tqdm(contacts_info.iterrows(), total=contacts_info.shape[0])
), on=OnConflictSpec(conflict=('pmcid', 'email'), update=('surname', 'given_name',)))

conn.close()
cur.close()