Here are some examples that I use to keep track of the various API calls requirements

---

### GET

Get a link info

```json
{
	"t": "get",
	"l": "<Link Hash>"
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

Create a link

```json
{
	"t": "del",
	"l": "<Link Hash>",
	"p": "<Hashed Password or empty>"
}
```

---

`* When a link is expired is removed from the server`
`** Only for supported versions`