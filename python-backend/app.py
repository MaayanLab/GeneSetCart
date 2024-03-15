import json
from flask import Flask, request
import pandas as pd
import umap
from sklearn.feature_extraction.text import TfidfVectorizer
from flask_cors import CORS


app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

def geneset_umap(geneset_genes):
    geneset_strings = []
    for geneset in geneset_genes:
        geneset_string= str(geneset).replace(',', ' ')
        geneset_strings.append(geneset_string)
    # create object
    tfidf = TfidfVectorizer()
    # get tf-df values
    result = tfidf.fit_transform(geneset_strings)   
    # in matrix form
    tf_idf_matrix = result.toarray()
    umap_model = umap.UMAP(n_components=2)
    geneset_umap = umap_model.fit_transform(tf_idf_matrix)
    umap_df = pd.DataFrame(geneset_umap, columns = ['x', 'y'])
    return umap_df

@app.route('/api/getUMAP', methods=['POST'])
def calculateUMAP():
    data = request.form.get('data')
    print(data)
    data = json.loads(data)
    # geneset_names = data['geneset_names']
    geneset_genes = data['geneset_genes']
    umap_df = geneset_umap(geneset_genes)
    return json.dumps(umap_df.to_dict('split')['data']) 

if __name__ == '__main__':
    app.run(debug=True)