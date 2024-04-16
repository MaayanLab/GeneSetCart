<code>POST</code> <code><b>/api/addGeneset </b></code> 

<br />

## PARAMETERS

| name      |  type     | data type               | description                                                           |
|-----------|-----------|-------------------------|-----------------------------------------------------------------------|
|   term    |  required | string                  | the name or description of the gene set                               |
|   genes   |  required | string[]                | a list of string containing genes in gene set                         |
|   description   |  required | string               | a short description of the gene set                          |

<br />

## RESPONSES

| http code     | content-type                      | response                                                            |
|---------------|-----------------------------------|---------------------------------------------------------------------|
| `200`         | application/json                  |  {"session_id":"clu1gfzj6003212xxhzuw8617"} unique id of newly created gene set   |
| `500`         | application/json                | {"code":"500","message":"Error processing request"}              |

<br />

## CODE EXAMPLE
```python
import json 
import requests

G2SG_URL =  'https://g2sg.cfde.cloud/api/addGeneset'
payload = {
    "term": "test set",
    "genes": ["FAM83E", "TJP3", "HEPACAM2", "GCNT3", "NXPE2", "LRRC31"],
    "description": "My test gene set" # or '' 
}

response = requests.post(G2SG_URL, json = payload)
if not response.ok:
    raise Exception('Error analyzing gene list')

session_id = response.json()['session_id']
geneset_link = 'https://g2sg.cfde.cloud/analyze/%s' % session_id
print(geneset_link) # e.g: https://g2sg.cfde.cloud/assemble/clu1gfzj6003212xxhzuw8617
```
