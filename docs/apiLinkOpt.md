Here are some examples that I use to keep track of the various API calls requirements

---

### GET

Get a link info

```json
{
	"t": "get",
	"l": "<Link Hash>",
	"track***": true
}
```

### SET

Create a link

```json
{
	"t": "set",
	"l": "<Link Hash>",
	"c": "<Number of clicks before link is expired*>",
	"e": "<Number of hours before link is expired*>",
	"d": "<AES Encrypted Data>",
	"p": "<AES Encrypted Options>",
	"o": [
			"<Extra Optional Server Options/Flags**>"
		]
}
```

### DEL

Delete a link

```json
{
	"t": "del",
	"l": "<Link Hash>",
	"p": "<Hashed Password or empty>"
}
```

### EDIT

Edit a link

```json
{
	"t": "edit",
	"l": "<Link Hash>",
	"p": "<Hashed Password>",
	"e": {
		"c": "<Optional number of clicks before link is expired*>",
		"d": "<Optional AES Encrypted Data>",
		"p": "<Optional AES Encrypted Options>"
	}
}
```

"e"/"c" and/or ("e"/"d" and "e"/"p") must be present

### STATS

Get a link's stats

```json
{
	"t": "stats",
	"l": "<Link Hash>",
	"p": "<Hashed Password>"
}
```
---

`* When a link is expired is removed from the server`
`** Only for supported versions`
`*** Allows tracking of `