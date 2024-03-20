import json
from flask import Flask, request
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import scanpy as sc
import anndata

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

def geneset_umap(geneset_genes):
    geneset_strings = []
    for term, geneset in geneset_genes.items():
        geneset_string= str(geneset).replace(',', ' ')
        geneset_strings.append(geneset_string)
    # create object
    tfidf = TfidfVectorizer(max_df=1.0, min_df=1)
    # get tf-df values
    X = tfidf.fit_transform(geneset_strings)   
    adata = anndata.AnnData(X)
    adata.obs.index = geneset_genes.keys()
    if len(geneset_genes.keys()) < 11:
        sc.pp.neighbors(adata, n_neighbors= len(geneset_genes.keys()) - 1, use_rep='X')
    else:
        sc.pp.neighbors(adata, n_neighbors=10, use_rep='X')
    sc.tl.leiden(adata, resolution=1.0)
    sc.tl.umap(adata, min_dist=0.1, spread=1.0, random_state=42)
    new_order = adata.obs.sort_values(by='leiden').index.tolist()
    adata = adata[new_order, :]
    adata.obs['leiden'] = 'Cluster ' + adata.obs['leiden'].astype('object')
    df = pd.DataFrame(adata.obsm['X_umap'])
    df.columns = ['x', 'y']
    df['cluster'] = adata.obs['leiden'].values
    df['term'] = adata.obs.index
    return df

@app.route('/api/getUMAP', methods=['POST'])
def calculateUMAP():
    data = request.get_json()
    geneset_genes = data['geneset_genes']
    umap_df = geneset_umap(geneset_genes)
    return json.dumps(umap_df.to_dict('split')['data']) 

if __name__ == '__main__':
    app.run(port=8000, debug=True, threading=True)