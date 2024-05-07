import json
from flask import Flask, request
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import scanpy as sc
import anndata
import io
import seaborn as sns
import matplotlib
matplotlib.use('agg')
from matplotlib import pyplot as plt
import numpy as np
from scipy.cluster.hierarchy import linkage, dendrogram, distance
from collections import defaultdict
from supervenn import supervenn


app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

def geneset_umap(geneset_genes, umapOptions):
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
        sc.pp.neighbors(adata, n_neighbors=umapOptions['nNeighbors'], use_rep='X')
    sc.tl.leiden(adata, resolution=1.0)
    sc.tl.umap(adata, min_dist=umapOptions['minDist'], spread=umapOptions['spread'], random_state=umapOptions['randomState'])
    new_order = adata.obs.sort_values(by='leiden').index.tolist()
    adata = adata[new_order, :]
    adata.obs['leiden'] = 'Cluster ' + adata.obs['leiden'].astype('object')
    df = pd.DataFrame(adata.obsm['X_umap'])
    df.columns = ['x', 'y']
    df['cluster'] = adata.obs['leiden'].values
    df['term'] = adata.obs.index
    return df

def jaccard_similarity(set1, set2):
    # intersection of two sets
    intersection = len(set1.intersection(set2))
    # Unions of two sets
    union = len(set1.union(set2))
     
    return intersection / union

def jaccard_similarity_multiple(genesets_dict):
    all_sets_jaccard = []
    for outer_geneset in list(genesets_dict.keys()): 
        jaccard_row = []
        for inner_geneset in list(genesets_dict.keys()):
            outer_genesets_genes = set(genesets_dict[outer_geneset])
            inner_genesets_genes = set(genesets_dict[inner_geneset]) 
            combo_jaccard_sim = jaccard_similarity(outer_genesets_genes, inner_genesets_genes)
            jaccard_row.append(combo_jaccard_sim)
        all_sets_jaccard.append(jaccard_row)
    return all_sets_jaccard

@app.route('/api/getUMAP', methods=['POST'])
def calculateUMAP():
    data = request.get_json()
    geneset_genes = data['genesetGenes']
    umapOptions = data['umapOptions']
    umap_df = geneset_umap(geneset_genes, umapOptions)
    return json.dumps(umap_df.to_dict('split')['data']) 

@app.route('/api/getHeatmap', methods=['POST'])
def createHeatmap():
    data = request.get_json()
    genesets_dict = data['genesets_dict']
    display_diagonal= data['display-diagonal']
    color_palette = data['color-palette']
    jindex_arrays = jaccard_similarity_multiple(genesets_dict)
    geneset_names = list(genesets_dict.keys())
    jindex_df = pd.DataFrame(jindex_arrays, columns=geneset_names) 
    jindex_df = jindex_df.set_axis(geneset_names, axis='index')
    jindex_df = jindex_df.rename_axis("Gene Sets", axis='index')
    jindex_df = jindex_df.rename_axis("Gene Sets", axis='columns')
    a = np.zeros((jindex_df.shape[0], jindex_df.shape[1]), int)
    correlations_array = np.asarray(jindex_df)
    row_linkage = linkage(
        distance.pdist(correlations_array), method='average')
    col_linkage = linkage(
        distance.pdist(correlations_array.T), method='average')
    if display_diagonal: 
        sns.clustermap(jindex_df, row_linkage=row_linkage, col_linkage=col_linkage, method="average", cmap=color_palette, vmin=0, yticklabels=(len(genesets_dict.keys()) < 40), xticklabels=(len(genesets_dict.keys()) < 40))
    else: 
        np.fill_diagonal(a, 5)
        mask = np.where(a == 5, True, False)
        plt.clf()
        sns.clustermap(jindex_df, row_linkage=row_linkage, col_linkage=col_linkage, method="average", cmap=color_palette, mask=mask, vmin=0, yticklabels=(len(genesets_dict.keys()) < 40), xticklabels=(len(genesets_dict.keys()) < 40))
    plt.rcParams["font.size"] = "12"
    # Save plot to a BytesIO object 
    img = io.BytesIO()
    plt.savefig(img, format='svg')
    img.seek(0)
    # # Convert BytesIO object to base64 string
    svg_data = img.getvalue().decode()
    img.close()
    plt.close()
    return svg_data


def get_cluster_classes(den, label='ivl'):
    cluster_idxs = defaultdict(list)
    for c, pi in zip(den['color_list'], den['icoord']):
        for leg in pi[1:3]:
            i = (leg - 5.0) / 10.0
            if abs(i - int(i)) < 1e-5:
                cluster_idxs[c].append(int(i))

    cluster_classes = {}
    for c, l in cluster_idxs.items():
        i_l = [den[label][i] for i in l]
        cluster_classes[c] = i_l
    return cluster_classes

@app.route('/api/getClusteredHeatmap', methods=['POST'])
def createClusteredHeatmap():
    data = request.get_json()
    genesets_dict = data['genesets_dict']
    jindex_arrays = jaccard_similarity_multiple(genesets_dict)
    geneset_strings = []
    for term, geneset in genesets_dict.items():
        geneset_string= str(geneset).replace(',', ' ')
        geneset_strings.append(geneset_string)
    # create object
    tfidf = TfidfVectorizer(max_df=1.0, min_df=1)
    # get tf-df values
    X = tfidf.fit_transform(geneset_strings)
    # link = linkage(X.toarray(), metric='correlation', method='average')
    link = linkage(jindex_arrays, metric='correlation', method='average', optimal_ordering=True)
    den = dendrogram(link, labels=list(genesets_dict.keys()), no_plot=True, count_sort=True)
    # get clusters
    clustered_classes = get_cluster_classes(den)
    return {'clustered_classes': clustered_classes}

@app.route('/api/get_supervenn', methods=['GET', 'POST']) 
def get_supervenn():
    if request.method == "POST":
        data = request.get_json()
        genesets_dict = data['genesets_dict']
        geneset_names = list(genesets_dict.keys())
        geneset_genes = list(genesets_dict.values())
        geneset_genes = [set(genes) for genes in geneset_genes]
        plt.clf()
        supervenn(geneset_genes, geneset_names, side_plots=False, widths_minmax_ratio=0.1,
        sets_ordering='minimize gaps', rotate_col_annotations=True, col_annotations_area_height=1.2)
        # Save plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='svg')
        img.seek(0)
        # # Convert BytesIO object to base64 string
        svg_data = img.getvalue().decode()
        img.close()
        return svg_data

if __name__ == '__main__':
    app.run(port=8000, debug=True, threading=True)