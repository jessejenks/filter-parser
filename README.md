# Filter Parser
Recenty I have been interested in parsers and interpreters. After reading about and
writing a few basic parsers, I decided I wanted to create my own language from
the bottom up!

This parser will eventually be used to filter blog posts on
[my website](https://verychill.biz).


To play with this yourself, clone this repo, 
```
git clone https://github.com/jessejenks/filter-parser.git
```
run your favorite server,
```
python -m SimpleHTTPServer 8000
python3 -m http.server 8000
```
and then navigate to `localhost:8000` in your browser.


## The Language
The purpose of this language is to allow users to type expressions which match
blog posts. I really wanted my language to be typed. However this is quite difficult,
especially since this needs to run in real time on a browser. So instead, I
tried to bake types into the language itself.

Since this language is specifically for filtering, the type of the entire
expression needs to be a boolean. A boolean expression can in turn be made up
of other boolean expressions with basic logical connectives ("and", "or",
"not"). But a boolean expression can _also_ be the result of comparing two
expressions of the same type, in this case dates and numbers. I had to rework
the language a few times so that only expressions of the same type can be
compared to one another.

| Keywords | |
| --- | --- |
| `before`, `after` | inequality check (only for dates) |
| `<`, `<=`, `>=`, `>` | inequality check (numbers and dates) |
| `is`, `=` | equality check (numbers and dates) |
| `$TODAY` | a special variable representing todays date |
| `$YESTERDAY` | a special variable representing yesterdays date |
| `$DATE` | a special symbol representing the date of a post |
| `$NUM_WORDS` | a special symbol representing the number of words in a post |
| `and` | |
| `or` | |
| `not` | |
| `true`, `false` | |

### Examples
| Expression | Result |
| --- | --- |
| `true` |  |
| `0 < 1` | return all posts. |
| `false` |  |
| `5 > 10` | return no posts. |
| `nice and cool` | return posts with both tags `nice` and `cool`. |
| `nice and cool and wow` | return posts with tags `nice` and `cool` and `wow`. |
| `nice and "cool and wow"` | return posts with both tags `nice` and `cool and wow`. |
| `nice and cool or ok and wow` | return posts with both tags `nice` and `cool`, or posts with both tags `ok` and `wow`. |
| `nice and (cool or ok) and wow` | return posts with tags `nice` and `wow` and at least one of `cool` or `ok`. |
| `$DATE before $TODAY` |  |
| `$DATE < $TODAY` | return posts written before, but not incuding today. |
| `$DATE before 09/01/2019` | return posts written before September 1st, 2019. |
| `$DATE after 09/01/2019` |  |
| `$DATE > 09/01/2019` | return posts written after, but not incuding September 1st, 2019. |
| `$DATE >= 09/01/2019` | return posts written on or after September 1st, 2019. |
| `$DATE is 09/01/2019` |  |
| `$DATE = 09/01/2019` | return posts written on the 1st of September 2019. |
| `$NUM_WORDS < 50` | return posts with fewer than 50 words in them. |


## Details of the language
### Tokens
| Type | Values |
| --- | --- |
| `binary-connective` | `"and"`, `"or"` |
| `negation` | `"not"` |
| `binary-predicate` | `is`, `=`, `before`, `after`, `<`, `<=`, `>=`, `>` |
| `date-literal` | matches MM-DD-YYYY or MM/DD/YYYY format |
| | e.g. `09/01/2019` or `09-01-2019` |
| `invalid-date-literal` | matches date format but is not an real date |
| | e.g. `09/45/2019` |
| `number-literal` | a number (integer) |
| | I don't allow floats for now |
| `boolean-literal` | `true` or `false` |
| `date-variable` | matches a date variable in the VARIABLES object |
| | currently these include `$DATE`, `$TODAY`, and `$YESTERDAY`. |
| `number-variable` | matches a number variable in the VARIABLES object |
| | currently this only includes `$NUM_WORDS`. |
| `tag` | matches a tag |
| `tag-literal` | a tag but wrapped in quotes "" |
| | this is used for tags with multiple words in them |
| | e.g. `wow nice` is two tags, but `"wow nice"` is just one |
| `unknown-tag-literal` | something wrapped in quotes, but didn't match any known tags |
| `left-paren` | left parenthesis `(` |
| `right-paren` | right parenthesis `)` |
| `punctuation` | one of `.` `,` `:` `;` |
| | not sure why I included these as they are fully ignored by the parser... |
| `whitespace` | spaces, newlines, etc. |
| `unknown` | didn't match anything |

### The Grammar
| Production Rules| |
| --- | --- |
| BooleanExpression | Disjunction ; |
| Disjunction | Conjunction ( DisjunctionSymbol Conjunction )* ; |
| DisjunctionSymbol  | `"or"` ; |
| Conjunction | Negation ( ConjunctionSymbol Negation )* ; |
| ConjunctionSymbol | `"and"` ; |
| Negation| NegationSymbol Negation |
| | BooleanLiteral |
| | Tag |
| | Comparison |
| | LeftParen BooleanExpression RightParen ; |
| NegationSymbol | `"not"` ; |
| BooleanLiteral | `"true"` |
| | `"false"` ; |
| LeftParen | `"("` ; |
| RightParen | `")"` ; |
| Tag | `[ tag ]` |
| | `[ tag-literal ]` |
| | `[ unknown-tag-literal ]` ; |
| Comparison | DateComparison |
| | NumberComparison ; |
| DateComparison | DateValue (DateEqualitySymbol \| DateInequalitySymbol) DateValue ; |
| DateValue | DateVariable |
| | DateLiteral ; |
| DateVariable | `"$DATE"` |
| | `"$TODAY"` |
| | `"$YESTERDAY"` ; |
| DateLiteral | `[ date-literal ]` |
| | `[ invalid-date-literal ]` ; |
| DateEqualitySymbol | EqualitySymbol ; |
| DateInequalitySymbol | `"before"` |
| | `"after"` |
| | InequalitySymbol ; |
| NumberComparison | NumberValue (NumberEqualitySymbol \| NumberInequalitySymbol) NumberValue ; |
| NumberValue | NumberVariable |
| | NumberLiteral ; |
| NumberVariable | `"$NUMWORDS"` ; |
| NumberLiteral | `[ number-literal ]` ; |
| NumberEqualitySymbol | EqualitySymbol ; |
| EqualitySymbol | `"is"` |
| | `"="` ; |
| NumberInequalitySymbol | InequalitySymbol ; |
| InequalitySymbol | `"<"` |
| | `"<="` |
| | `">"` |
| | `">="` ; |