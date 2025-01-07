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
import requests
import venn
from gene_info_utils import ncbi_genes_lookup
import pyenrichr as pye


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

def overlap_multiple(genesets_dict):
    all_sets_overlap = []
    for outer_geneset in list(genesets_dict.keys()): 
        overlap_row = []
        for inner_geneset in list(genesets_dict.keys()):
            outer_genesets_genes = set(genesets_dict[outer_geneset])
            inner_genesets_genes = set(genesets_dict[inner_geneset]) 
            overlap_genes = outer_genesets_genes.intersection(inner_genesets_genes)
            overlap_row.append(len(overlap_genes))
        all_sets_overlap.append(overlap_row)
    return all_sets_overlap

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
    annotation_text= data['annot']
    color_palette = data['color-palette']
    font_size = data['font-size']
    disable_labels  = data['disable-labels']
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
    if annotation_text == True: 
        annotation_text = overlap_multiple(genesets_dict)
    if display_diagonal: 
        sns.clustermap(jindex_df, row_linkage=row_linkage, col_linkage=col_linkage, method="average", cmap=color_palette, vmin=0, yticklabels=not(disable_labels), xticklabels=not(disable_labels), annot=annotation_text, fmt='g')
    else: 
        np.fill_diagonal(a, 5)
        mask = np.where(a == 5, True, False)
        plt.clf()
        sns.clustermap(jindex_df, row_linkage=row_linkage, col_linkage=col_linkage, method="average", cmap=color_palette, mask=mask, vmin=0, yticklabels=not(disable_labels), xticklabels=not(disable_labels), annot=annotation_text, fmt='g')
    plt.rcParams["font.size"] = font_size
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

@app.route('/api/get_venn', methods=['GET', 'POST']) 
def get_venn():
    if request.method == "POST":
        data = request.get_json()
        genesets_dict = data['genesets_dict']
        geneset_names = list(genesets_dict.keys())
        geneset_genes = list(genesets_dict.values())
        geneset_genes = [set(genes) for genes in geneset_genes]
        for index, geneset in enumerate(geneset_names): 
            genesets_dict[geneset] = geneset_genes[index]
        plt.clf()
        venn.venn(genesets_dict)
        # Save plot to a BytesIO object
        img = io.BytesIO()
        plt.savefig(img, format='svg')
        img.seek(0)
        # # Convert BytesIO object to base64 string
        svg_data = img.getvalue().decode()
        img.close()
        return svg_data
    
@app.route('/api/get_PPI_genes', methods=['GET', 'POST']) 
def getPPIGenes():
    if request.method == "POST":
        data = request.get_json()
        input_genes = data['input_genes']
        G2N_URL = 'https://maayanlab.cloud/G2N/api'
        defaults = {
        'text-genes': (None, '\n'.join(input_genes)),
        'min_network_size': (None, 10),
        'path_length': (None, 2),
        'min_number_of_articles_supporting_interaction': (None, 0),
        'max_number_of_interactions_per_protein': (None, 200),
        'max_number_of_interactions_per_article': (None, 100),
        'enable_BioGRID': (None, True),
        'enable_IntAct': (None, True),
        'enable_MINT': (None, True),
        'enable_ppid': (None, True),
        'enable_Stelzl': (None, True),
        'enable_BioPlex': (None, True)
        }

        response = requests.post(G2N_URL, files=defaults)
        json_response = response.json()
        nodes = json.loads(json_response['G2N'])['network']['nodes']
        ppi_genes = [node['name'] for node in nodes]
        return {'ppi_genes': ppi_genes}
    
        
SPECIES_SET = set([
    'Invertebrates/Anopheles_gambiae',
    'Invertebrates/Caenorhabditis_elegans',
    'Invertebrates/Drosophila_melanogaster',
    'Mammalia/Bos_taurus',
    'Mammalia/Canis_familiaris',
    'Mammalia/Homo_sapiens',
    'Mammalia/Mus_musculus',
    'Mammalia/Pan_troglodytes',
    'Mammalia/Rattus_norvegicus',
    'Mammalia/Sus_scrofa',
    'Non-mammalian_vertebrates/Danio_reri',
    'Non-mammalian_vertebrates/Gallus_gallus',
    'Non-mammalian_vertebrates/Xenopus_laevis',
    'Non-mammalian_vertebrates/Xenopus_tropicalis',
    'Plants/Arabidopsis_thaliana',
    'Plants/Chlamydomonas_reinhardtii',
    'Plants/Oryza_sativa',
    'Plants/Zea_mays']
)
    
@app.route('/api/gene_lookup', methods=['GET', 'POST'])
def gene_lookup():
    if request.method == "POST":
        data = request.get_json()
        input_genes = data['input_genes']
        species = data['species']
        if species not in SPECIES_SET:
            return {'error': f"Species {species} not supported"}
        lookup = ncbi_genes_lookup(species=species).get
        converted = [lookup(gene) for gene in input_genes]
        return {'converted': converted}
    
@app.route('/api/gene_conversion', methods=['GET', 'POST'])
def gene_conversion():
    if request.method == "POST":
        data = request.get_json()
        input_genes = data['input_genes']
        human_offical = set(ncbi_genes_lookup(species='Homo_sapiens').values())
        human_converted = [input_g.upper() for input_g in input_genes if input_g.upper() in human_offical]
        return {'human_converted': human_converted}

CFDE_LIB_LINKS = {
    "Glygen Glycosylated Proteins": "https://cfde-drc.s3.amazonaws.com/GlyGen/XMT/2022-12-13/GlyGen_XMT_2022-12-13_GlyGen_Glycosylated_Proteins_2022.gmt",
    "GTEx Tissue-Specific Aging Signatures": "https://cfde-drc.s3.amazonaws.com/GTEx/XMT/2022-06-06/GTEx_XMT_2022-06-06_GTEx_Aging_Signatures_2021.gmt",
    "GTEx Tissue Gene Expression Profiles": "https://cfde-drc.s3.amazonaws.com/GTEx/XMT/2023-03-10/GTEx_XMT_2023-03-10_GTEx_Tissues_V8_2023.gmt",
    "IDG Drug Targets": "https://cfde-drc.s3.amazonaws.com/IDG/XMT/2022-12-13/IDG_XMT_2022-12-13_IDG_Drug_Targets_2022.gmt",
    "KOMP2 Mouse Phenotypes": "https://cfde-drc.s3.amazonaws.com/KOMP2/XMT/2022-12-13/KOMP2_XMT_2022-12-13_KOMP2_Mouse_Phenotypes_2022.gmt",
    "LINCS L1000 CMAP Chemical Pertubation Consensus Signatures": "https://cfde-drc.s3.amazonaws.com/LINCS/XMT/2022-12-13/LINCS_XMT_2022-12-13_LINCS_L1000_Chem_Pert_Consensus_Sigs.gmt",
    "LINCS L1000 CMAP CRISPR Knockout Consensus Signatures": "https://cfde-drc.s3.amazonaws.com/LINCS/XMT/2022-12-13/LINCS_XMT_2022-12-13_LINCS_L1000_CRISPR_KO_Consensus_Sigs.gmt",
    "MoTrPAC Rat Endurance Exercise Training": "https://cfde-drc.s3.amazonaws.com/MoTrPAC/XMT/2023-09-29/MoTrPAC_XMT_2023-09-29_MoTrPAC_Rat_Exercise_Sigs_2023.gmt",
    "Metabolomics Gene-Metabolite Associations": "https://cfde-drc.s3.amazonaws.com/MW/XMT/2022-12-13/MW_XMT_2022-12-13_Metabolomics_Workbench_Metabolites_2022.gmt",
    "Human BioMolecular Atlas Program Azimuth": "https://minio.dev.maayanlab.cloud/g2sg/CFDE%20libraries/HubMAP_Azimuth_2023_Augmented.gmt",
}

@app.route('/api/cross_user_set')
def cross_user_set():
    if request.method == "POST":
        data = request.get_json()
        input_genes = data['input_genes']
        cfde_lib = data['cfde_lib']
        cfde_lib_txt = requests.get(CFDE_LIB_LINKS[cfde_lib]).text
        cfde_lib_gmt = {}
        for line in cfde_lib_txt.split('\n'):
            split_line = line.strip().split('\t')
            term = split_line[0]
            genes = split_line[2:]
            if len(genes) > 0:
                cfde_lib_gmt[term] = set(genes)  
        human_offical = set(ncbi_genes_lookup(species='Homo_sapiens').values())
        human_converted = [input_g.upper() for input_g in input_genes if input_g.upper() in human_offical]
        fisher = pye.enrichment.FastFisher(34000)
        result = pye.enrichment.fisher(human_converted, cfde_lib_gmt, fisher=fisher)
        return {'result': result.to_dict()}

if __name__ == '__main__':
    app.run(port=8000, debug=True, threading=True)