<code>POST</code> <code><b>/api/addMultipleGenesets </b></code> 

<br />

## PARAMETERS

| name      |  type     | data type               | description                                                           |
|-----------|-----------|-------------------------|-----------------------------------------------------------------------|
|           |  [{"term": string, "genes": string[], description: string  }] | application/json                   | a list containing the gene sets to be added |

<br />

## RESPONSES

| http code     | content-type                      | response                                                            | description         |
|---------------|-----------------------------------|---------------------------------------------------------------------| ------------------ |
| `200`         | application/json                  |  {"session_id":"clu1gfzj6003212xxhzuw8617"} | unique id of newly created session containing gene sets   |
| `500`         | application/json                | {"code":"500","message":"Error processing request"}              | |

<br />

## CODE EXAMPLE
```python
import json 
import requests

G2SG_URL =  'https://g2sg.cfde.cloud/api/addMultipleGenesets'

payload = [{
    "term": "test set 1",
    "genes": ["FAM83E", "TJP3", "HEPACAM2", "GCNT3", "NXPE2", "LRRC31"],
    "description": "First gene set"
}, 
{
    "term": "test set 2",
    "genes": ["ACTB", "ACTG1", "ADAR", "PARP1", "FAM83E", "AGXT", "ALDOA"],
    "description": "Second gene set"
}]

response = requests.post(G2SG_URL, json = payload)
if not response.ok:
    raise Exception('Error analyzing gene list')

session_id = response.json()['session_id']
geneset_link = 'https://g2sg.cfde.cloud/analyze/%s' % session_id
print(geneset_link) # e.g: https://g2sg.cfde.cloud/analyze/clu1gfzj6003212xxhzuw8617
```
