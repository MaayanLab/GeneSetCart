# GeneSetCart
This is an application for assembling, augmenting, combining, visualizing and analyzing gene sets: [genesetcart.cfde.cloud](genesetcart.cfde.cloud)

## Getting Started
```bash
# go to app (imagineset) directory
cd imagineset
# prepare .env file & review
cp .env.example .env
# start database
#  (NOTE: If you're running another postgres database on your system, you should turn it off as the ports will conflict)
docker-compose up -d g2sg-postgres
# install node modules
npm i
# initialize prisma
npx prisma migrate deploy
# run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the platform.

## .env File Set Up
For the `NEXTAUTH_SECRET` value
Run
```
openssl rand -base64 32
```
Set NEXTAUTH_URL=http://localhost:3000

## Running the python backend
To run the python backend. Run the command: 
``` 
gunicorn --workers 2 --timeout 600 --bind 0.0.0.0:8000 app:app
```
And set PYTHON_API_BASE='http://0.0.0.0:8000' in the .env file


## Provisioning the Database
To use the site, you have to populate your local database with gene and crossing pairs data. Firstly, make sure apply migrations to create the tables
```bash
# go to app (imagineset) directory
cd imagineset
npx prisma migrate deploy
```
and then run ingest script in database directory to add the data to these tables
```bash
# go to database directory (use the following commands if in imagineset directory):
cd ..
cd database
# download requirements
pip install -r requirements.txt
# prepare .env file containing DATABASE_URL
cp .env.example .env
# run ingest script
python3 ingest.py
```

