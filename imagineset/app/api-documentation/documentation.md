# ADDING GENE SET TO A NEW SESSION
<details>
 <summary>
 <code>POST</code> <code><b>/</b></code> addGeneset
 </summary>

## Parameters

| name      |  type     | data type               | description                                                           |
|-----------|-----------|-------------------------|-----------------------------------------------------------------------|
|   term    |  required | string                  | the name or description of the gene set                               |
|   genes   |  required | string[]                | a list of string containing genes in gene set                         |


### Responses

| http code     | content-type                      | response                                                            |
|---------------|-----------------------------------|---------------------------------------------------------------------|
| `200`         | `text/plain;charset=UTF-8`        | unique id of newly created gene set e.g clu1gfzj6003212xxhzuw8617                                |
| `500`         | `application/json`                | `{"code":"500","message":"Error processing request" `                            |



```python
import json 
```
</details>

------------------------------------------------------------------------------------------