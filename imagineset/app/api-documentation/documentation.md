# ADDING GENE SET TO A NEW SESSION
<details>
 <summary>
 <code>POST</code> <code><b>/</b></code> addGeneset
 </summary>

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
| `200`         | `text/plain;charset=UTF-8`        | unique id of newly created gene set e.g clu1gfzj6003212xxhzuw8617   |
| `500`         | `application/json`                | `{"code":"500","message":"Error processing request" `               |

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

session_id = json.loads(response.text)
geneset_link = 'https://g2sg.cfde.cloud/assemble/%s' % session_id
print(geneset_link) # e.g: https://g2sg.cfde.cloud/assemble/clu1gfzj6003212xxhzuw8617
```
</details>
------------------------------------------------------------------------------------------