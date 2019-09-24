# Filter Parser
I recently got interested in parsers and interpreters. After reading about and
writing a few basic parsers, I decided I wanted to create my own language from
the bottom up!

This parser will eventually be used to filter blog posts on
[my website](https://verychill.biz).

Each post has a set of 'tags' and a 'date'. This language also allows for
filtering by number of words, but that's not a real thing. Just a proof of
concept

## The Language
### Tokens
`binary-connective`
    "and", "or"

`negation`
    "not"

`binary-predicate`
    `is`, `=`, `before`, `after`, `<`, `<=`, `>=`, `>`

`date-literal`
    matches MM-DD-YYYY format

`invalid-date-literal`
    matches MM-DD-YYYY format but is not an actual date

`number-literal`
    a number (integer)
    I don't allow floats for now

`boolean-literal`
    `true` or `false`

`date-variable`
    matches a date variable in the VARIABLES object
    currently these include `$DATE`, `$TODAY`, and `$YESTERDAY`.

`number-variable`
    matches a number variable in the VARIABLES object
    currently this only includes `$NUM_WORDS`.

`tag`
    matches a tag

`tag-literal`
    a tag but wrapped in quotes ""
    this is used for tags with multiple words in them
    e.g. `wow nice` is two tags, but `"wow nice"` is just one

`left-paren`
    left parenthesis `(`

`right-paren`
    right parenthesis `)`

`punctuation`
    one of `.` `,` `:` `;`
    not sure why I included this as it is fully ignored by the parser...

`whitespace`
    spaces, newlines, etc.

`unknown`
    didn't match anything

### The Grammar
I really wanted my language to be typed. However this is quite difficult,
especially since this needs to run in real time on a browser. So instead, I
tried to bake types into the language itself.

Since this language is specifically for filtering, the type of the entire parse
tree needs to be a boolean. A boolean expression can in turn be made up of other
boolean expressions with basic logical connectives ("and", "or", "not"). But a
boolean expression can _also_ be the result of comparing two expressions of the
same type. In this case dates and numbers. I had to rework the language a few
times so that only expressions of the same type can be compared to one another.

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
| | `[ tag-literal ]` ; |
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