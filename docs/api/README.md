# media-query-parser

## Table of contents

### Type aliases

- **[AST](README.md#ast)**

- [AtKeywordToken](README.md#atkeywordtoken)
- [CDCToken](README.md#cdctoken)
- [CDOToken](README.md#cdotoken)
- [ColonToken](README.md#colontoken)
- [CommaToken](README.md#commatoken)
- [DelimToken](README.md#delimtoken)
- [DimensionToken](README.md#dimensiontoken)
- [EOFToken](README.md#eoftoken)
- [FunctionToken](README.md#functiontoken)
- [HashToken](README.md#hashtoken)
- [IdentToken](README.md#identtoken)
- [LeftBracketToken](README.md#leftbrackettoken)
- [LeftCurlyToken](README.md#leftcurlytoken)
- [LeftParenToken](README.md#leftparentoken)
- [MediaCondition](README.md#mediacondition)
- [MediaFeature](README.md#mediafeature)
- [MediaFeatureBoolean](README.md#mediafeatureboolean)
- [MediaFeatureRange](README.md#mediafeaturerange)
- [MediaFeatureValue](README.md#mediafeaturevalue)
- [MediaQuery](README.md#mediaquery)
- [NumberToken](README.md#numbertoken)
- [PercentageToken](README.md#percentagetoken)
- [RatioToken](README.md#ratiotoken)
- [RightBracketToken](README.md#rightbrackettoken)
- [RightCurlyToken](README.md#rightcurlytoken)
- [RightParenToken](README.md#rightparentoken)
- [SemicolonToken](README.md#semicolontoken)
- [StringToken](README.md#stringtoken)
- [Token](README.md#token)
- [UrlToken](README.md#urltoken)
- [ValidRange](README.md#validrange)
- [ValidRangeToken](README.md#validrangetoken)
- [ValidValueToken](README.md#validvaluetoken)
- [WhitespaceToken](README.md#whitespacetoken)

### Functions

- **[toAST](README.md#toast)**

- [consumeEscape](README.md#consumeescape)
- [consumeIdent](README.md#consumeident)
- [consumeIdentLike](README.md#consumeidentlike)
- [consumeIdentUnsafe](README.md#consumeidentunsafe)
- [consumeNumber](README.md#consumenumber)
- [consumeNumeric](README.md#consumenumeric)
- [consumeString](README.md#consumestring)
- [consumeUrl](README.md#consumeurl)
- [lexicalAnalysis](README.md#lexicalanalysis)
- [removeWhitespace](README.md#removewhitespace)
- [syntacticAnalysis](README.md#syntacticanalysis)
- [toUnflattenedAST](README.md#tounflattenedast)
- [tokenizeMediaCondition](README.md#tokenizemediacondition)
- [tokenizeMediaFeature](README.md#tokenizemediafeature)
- [tokenizeMediaQuery](README.md#tokenizemediaquery)
- [tokenizeRange](README.md#tokenizerange)
- [wouldStartIdentifier](README.md#wouldstartidentifier)

## Type aliases

### AST

?? **AST**: [_MediaQuery_](README.md#mediaquery)[]

Defined in:
[parse/syntacticAnalysis.ts:12](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L12)

---

### AtKeywordToken

?? **AtKeywordToken**: { `type`: _<at-keyword-token>_ ; `value`: _string_ }

#### Type declaration:

| Name    | Type                 |
| ------- | -------------------- |
| `type`  | _<at-keyword-token>_ |
| `value` | _string_             |

Defined in:
[parse/lexicalAnalysis.ts:79](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L79)

---

### CDCToken

?? **CDCToken**: { `type`: _<CDC-token>_ }

#### Type declaration:

| Name   | Type          |
| ------ | ------------- |
| `type` | _<CDC-token>_ |

Defined in:
[parse/lexicalAnalysis.ts:67](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L67)

---

### CDOToken

?? **CDOToken**: { `type`: _<CDO-token>_ }

#### Type declaration:

| Name   | Type          |
| ------ | ------------- |
| `type` | _<CDO-token>_ |

Defined in:
[parse/lexicalAnalysis.ts:76](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L76)

---

### ColonToken

?? **ColonToken**: { `type`: _<colon-token>_ }

#### Type declaration:

| Name   | Type            |
| ------ | --------------- |
| `type` | _<colon-token>_ |

Defined in:
[parse/lexicalAnalysis.ts:70](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L70)

---

### CommaToken

?? **CommaToken**: { `type`: _<comma-token>_ }

#### Type declaration:

| Name   | Type            |
| ------ | --------------- |
| `type` | _<comma-token>_ |

Defined in:
[parse/lexicalAnalysis.ts:42](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L42)

---

### DelimToken

?? **DelimToken**: { `type`: _<delim-token>_ ; `value`: _number_ }

#### Type declaration:

| Name    | Type            |
| ------- | --------------- |
| `type`  | _<delim-token>_ |
| `value` | _number_        |

Defined in:
[parse/lexicalAnalysis.ts:38](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L38)

---

### DimensionToken

?? **DimensionToken**: { `flag`: _number_ ; `type`: _<dimension-token>_ ; `unit`:
_string_ ; `value`: _number_ }

#### Type declaration:

| Name    | Type                |
| ------- | ------------------- |
| `flag`  | _number_            |
| `type`  | _<dimension-token>_ |
| `unit`  | _string_            |
| `value` | _number_            |

Defined in:
[parse/lexicalAnalysis.ts:51](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L51)

---

### EOFToken

?? **EOFToken**: { `type`: _<EOF-token>_ }

#### Type declaration:

| Name   | Type          |
| ------ | ------------- |
| `type` | _<EOF-token>_ |

Defined in:
[parse/lexicalAnalysis.ts:95](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L95)

---

### FunctionToken

?? **FunctionToken**: { `type`: _<function-token>_ ; `value`: _string_ }

#### Type declaration:

| Name    | Type               |
| ------- | ------------------ |
| `type`  | _<function-token>_ |
| `value` | _string_           |

Defined in:
[parse/lexicalAnalysis.ts:102](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L102)

---

### HashToken

?? **HashToken**: { `flag`: _id_ | _unrestricted_ ; `type`: _<hash-token>_ ;
`value`: _string_ }

#### Type declaration:

| Name    | Type           |
| ------- | -------------- | -------------- |
| `flag`  | _id_           | _unrestricted_ |
| `type`  | _<hash-token>_ |
| `value` | _string_       |

Defined in:
[parse/lexicalAnalysis.ts:33](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L33)

---

### IdentToken

?? **IdentToken**: { `type`: _<ident-token>_ ; `value`: _string_ }

#### Type declaration:

| Name    | Type            |
| ------- | --------------- |
| `type`  | _<ident-token>_ |
| `value` | _string_        |

Defined in:
[parse/lexicalAnalysis.ts:98](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L98)

---

### LeftBracketToken

?? **LeftBracketToken**: { `type`: _<[-token>_ }

#### Type declaration:

| Name   | Type        |
| ------ | ----------- |
| `type` | _<[-token>_ |

Defined in:
[parse/lexicalAnalysis.ts:83](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L83)

---

### LeftCurlyToken

?? **LeftCurlyToken**: { `type`: _<{-token>_ }

#### Type declaration:

| Name   | Type        |
| ------ | ----------- |
| `type` | _<{-token>_ |

Defined in:
[parse/lexicalAnalysis.ts:89](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L89)

---

### LeftParenToken

?? **LeftParenToken**: { `type`: _<(-token>_ }

#### Type declaration:

| Name   | Type        |
| ------ | ----------- |
| `type` | _<(-token>_ |

Defined in:
[parse/lexicalAnalysis.ts:45](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L45)

---

### MediaCondition

?? **MediaCondition**: { `children`:
([_MediaCondition_](README.md#mediacondition) |
[_MediaFeature_](README.md#mediafeature))[] ; `operator`: _and_ | _or_ | _not_ |
_null_ }

#### Type declaration:

| Name       | Type                                          |
| ---------- | --------------------------------------------- | ------------------------------------------- | ----- | ------ |
| `children` | ([_MediaCondition_](README.md#mediacondition) | [_MediaFeature_](README.md#mediafeature))[] |
| `operator` | _and_                                         | _or_                                        | _not_ | _null_ |

Defined in:
[parse/syntacticAnalysis.ts:224](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L224)

---

### MediaFeature

?? **MediaFeature**: [_MediaFeatureBoolean_](README.md#mediafeatureboolean) |
[_MediaFeatureValue_](README.md#mediafeaturevalue) |
[_MediaFeatureRange_](README.md#mediafeaturerange)

Defined in:
[parse/syntacticAnalysis.ts:322](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L322)

---

### MediaFeatureBoolean

?? **MediaFeatureBoolean**: { `context`: _boolean_ ; `feature`: _string_ }

#### Type declaration:

| Name      | Type      |
| --------- | --------- |
| `context` | _boolean_ |
| `feature` | _string_  |

Defined in:
[parse/syntacticAnalysis.ts:326](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L326)

---

### MediaFeatureRange

?? **MediaFeatureRange**: { `context`: _range_ ; `feature`: _string_ ; `range`:
[_ValidRange_](README.md#validrange) }

#### Type declaration:

| Name      | Type                                 |
| --------- | ------------------------------------ |
| `context` | _range_                              |
| `feature` | _string_                             |
| `range`   | [_ValidRange_](README.md#validrange) |

Defined in:
[parse/syntacticAnalysis.ts:336](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L336)

---

### MediaFeatureValue

?? **MediaFeatureValue**: { `context`: _value_ ; `feature`: _string_ ; `prefix`:
_min_ | _max_ | _null_ ; `value`: [_ValidValueToken_](README.md#validvaluetoken)
}

#### Type declaration:

| Name      | Type                                           |
| --------- | ---------------------------------------------- | ----- | ------ |
| `context` | _value_                                        |
| `feature` | _string_                                       |
| `prefix`  | _min_                                          | _max_ | _null_ |
| `value`   | [_ValidValueToken_](README.md#validvaluetoken) |

Defined in:
[parse/syntacticAnalysis.ts:330](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L330)

---

### MediaQuery

?? **MediaQuery**: { `mediaCondition`:
[_MediaCondition_](README.md#mediacondition) | _null_ ; `mediaPrefix`: _not_ |
_only_ | _null_ ; `mediaType`: _all_ | _screen_ | _print_ }

#### Type declaration:

| Name             | Type                                         |
| ---------------- | -------------------------------------------- | -------- | ------- |
| `mediaCondition` | [_MediaCondition_](README.md#mediacondition) | _null_   |
| `mediaPrefix`    | _not_                                        | _only_   | _null_  |
| `mediaType`      | _all_                                        | _screen_ | _print_ |

Defined in:
[parse/syntacticAnalysis.ts:117](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L117)

---

### NumberToken

?? **NumberToken**: { `flag`: _number_ | _integer_ ; `type`: _<number-token>_ ;
`value`: _number_ }

#### Type declaration:

| Name    | Type             |
| ------- | ---------------- | --------- |
| `flag`  | _number_         | _integer_ |
| `type`  | _<number-token>_ |
| `value` | _number_         |

Defined in:
[parse/lexicalAnalysis.ts:57](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L57)

---

### PercentageToken

?? **PercentageToken**: { `flag`: _number_ ; `type`: _<percentage-token>_ ;
`value`: _number_ }

#### Type declaration:

| Name    | Type                 |
| ------- | -------------------- |
| `flag`  | _number_             |
| `type`  | _<percentage-token>_ |
| `value` | _number_             |

Defined in:
[parse/lexicalAnalysis.ts:62](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L62)

---

### RatioToken

?? **RatioToken**: { `denominator`: _number_ ; `numerator`: _number_ ; `type`:
_<ratio-token>_ }

#### Type declaration:

| Name          | Type            |
| ------------- | --------------- |
| `denominator` | _number_        |
| `numerator`   | _number_        |
| `type`        | _<ratio-token>_ |

Defined in:
[parse/syntacticAnalysis.ts:443](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L443)

---

### RightBracketToken

?? **RightBracketToken**: { `type`: _<]-token>_ }

#### Type declaration:

| Name   | Type        |
| ------ | ----------- |
| `type` | _<]-token>_ |

Defined in:
[parse/lexicalAnalysis.ts:86](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L86)

---

### RightCurlyToken

?? **RightCurlyToken**: { `type`: _<}-token>_ }

#### Type declaration:

| Name   | Type        |
| ------ | ----------- |
| `type` | _<}-token>_ |

Defined in:
[parse/lexicalAnalysis.ts:92](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L92)

---

### RightParenToken

?? **RightParenToken**: { `type`: _<)-token>_ }

#### Type declaration:

| Name   | Type        |
| ------ | ----------- |
| `type` | _<)-token>_ |

Defined in:
[parse/lexicalAnalysis.ts:48](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L48)

---

### SemicolonToken

?? **SemicolonToken**: { `type`: _<semicolon-token>_ }

#### Type declaration:

| Name   | Type                |
| ------ | ------------------- |
| `type` | _<semicolon-token>_ |

Defined in:
[parse/lexicalAnalysis.ts:73](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L73)

---

### StringToken

?? **StringToken**: { `type`: _<string-token>_ ; `value`: _string_ }

#### Type declaration:

| Name    | Type             |
| ------- | ---------------- |
| `type`  | _<string-token>_ |
| `value` | _string_         |

Defined in:
[parse/lexicalAnalysis.ts:29](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L29)

---

### Token

?? **Token**: [_WhitespaceToken_](README.md#whitespacetoken) |
[_StringToken_](README.md#stringtoken) | [_HashToken_](README.md#hashtoken) |
[_DelimToken_](README.md#delimtoken) | [_CommaToken_](README.md#commatoken) |
[_LeftParenToken_](README.md#leftparentoken) |
[_RightParenToken_](README.md#rightparentoken) |
[_DimensionToken_](README.md#dimensiontoken) |
[_NumberToken_](README.md#numbertoken) |
[_PercentageToken_](README.md#percentagetoken) |
[_IdentToken_](README.md#identtoken) |
[_FunctionToken_](README.md#functiontoken) | [_UrlToken_](README.md#urltoken) |
[_CDCToken_](README.md#cdctoken) | [_ColonToken_](README.md#colontoken) |
[_SemicolonToken_](README.md#semicolontoken) | [_CDOToken_](README.md#cdotoken)
| [_AtKeywordToken_](README.md#atkeywordtoken) |
[_LeftBracketToken_](README.md#leftbrackettoken) |
[_RightBracketToken_](README.md#rightbrackettoken) |
[_LeftCurlyToken_](README.md#leftcurlytoken) |
[_RightCurlyToken_](README.md#rightcurlytoken) |
[_EOFToken_](README.md#eoftoken)

Defined in:
[parse/lexicalAnalysis.ts:1](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L1)

---

### UrlToken

?? **UrlToken**: { `type`: _<url-token>_ ; `value`: _string_ }

#### Type declaration:

| Name    | Type          |
| ------- | ------------- |
| `type`  | _<url-token>_ |
| `value` | _string_      |

Defined in:
[parse/lexicalAnalysis.ts:106](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L106)

---

### ValidRange

?? **ValidRange**: { `featureName`: _string_ ; `leftOp`: _<_ | _<=_ ;
`leftToken`: [_ValidRangeToken_](README.md#validrangetoken) ; `rightOp`: _<_ |
_<=_ ; `rightToken`: [_ValidRangeToken_](README.md#validrangetoken) } | {
`featureName`: _string_ ; `leftOp`: _>_ | _>=_ ; `leftToken`:
[_ValidRangeToken_](README.md#validrangetoken) ; `rightOp`: _>_ | _>=_ ;
`rightToken`: [_ValidRangeToken_](README.md#validrangetoken) } | {
`featureName`: _string_ ; `leftOp`: _>_ | _>=_ | _<_ | _<=_ | _=_ ; `leftToken`:
[_ValidRangeToken_](README.md#validrangetoken) ; `rightOp`: _null_ ;
`rightToken`: _null_ } | { `featureName`: _string_ ; `leftOp`: _null_ ;
`leftToken`: _null_ ; `rightOp`: _>_ | _>=_ | _<_ | _<=_ | _=_ ; `rightToken`:
[_ValidRangeToken_](README.md#validrangetoken) }

Defined in:
[parse/syntacticAnalysis.ts:469](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L469)

---

### ValidRangeToken

?? **ValidRangeToken**: [_NumberToken_](README.md#numbertoken) |
[_DimensionToken_](README.md#dimensiontoken) |
[_RatioToken_](README.md#ratiotoken) | { `type`: _<ident-token>_ ; `value`:
_infinite_ }

Defined in:
[parse/syntacticAnalysis.ts:448](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L448)

---

### ValidValueToken

?? **ValidValueToken**: [_NumberToken_](README.md#numbertoken) |
[_DimensionToken_](README.md#dimensiontoken) |
[_RatioToken_](README.md#ratiotoken) | [_IdentToken_](README.md#identtoken)

Defined in:
[parse/syntacticAnalysis.ts:341](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L341)

---

### WhitespaceToken

?? **WhitespaceToken**: { `type`: _<whitespace-token>_ }

#### Type declaration:

| Name   | Type                 |
| ------ | -------------------- |
| `type` | _<whitespace-token>_ |

Defined in:
[parse/lexicalAnalysis.ts:26](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L26)

## Functions

### consumeEscape

??? `Const`**consumeEscape**(`str`: _string_, `index`: _number_): _null_ |
[*number*, *number*]

#### Parameters:

| Name    | Type     |
| ------- | -------- |
| `str`   | _string_ |
| `index` | _number_ |

**Returns:** [*number*, *number*]

Defined in:
[parse/lexicalAnalysis.ts:524](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L524)

---

### consumeIdent

??? `Const`**consumeIdent**(`str`: _string_, `index`: _number_): _null_ |
[*number*, *string*]

#### Parameters:

| Name    | Type     |
| ------- | -------- |
| `str`   | _string_ |
| `index` | _number_ |

**Returns:** [*number*, *string*]

Defined in:
[parse/lexicalAnalysis.ts:734](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L734)

---

### consumeIdentLike

??? `Const`**consumeIdentLike**(`str`: _string_, `index`: _number_): _null_ |
[*number*, *string*, *<ident-token>* | *<function-token>* | *<url-token>*]

#### Parameters:

| Name    | Type     |
| ------- | -------- |
| `str`   | _string_ |
| `index` | _number_ |

**Returns:** [*number*, *string*, *<ident-token>* | *<function-token>* |
*<url-token>*]

Defined in:
[parse/lexicalAnalysis.ts:806](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L806)

---

### consumeIdentUnsafe

??? `Const`**consumeIdentUnsafe**(`str`: _string_, `index`: _number_): _null_ |
[*number*, *string*]

#### Parameters:

| Name    | Type     |
| ------- | -------- |
| `str`   | _string_ |
| `index` | _number_ |

**Returns:** [*number*, *string*]

Defined in:
[parse/lexicalAnalysis.ts:695](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L695)

---

### consumeNumber

??? `Const`**consumeNumber**(`str`: _string_, `index`: _number_): _null_ |
[*number*, *number*, *number* | *integer*]

#### Parameters:

| Name    | Type     |
| ------- | -------- |
| `str`   | _string_ |
| `index` | _number_ |

**Returns:** [*number*, *number*, *number* | *integer*]

Defined in:
[parse/lexicalAnalysis.ts:599](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L599)

---

### consumeNumeric

??? `Const`**consumeNumeric**(`str`: _string_, `index`: _number_): _null_ |
[_number_, [*<number-token>*, *number*, *number* | *integer*] |
[*<percentage-token>*, *number*] | [*<dimension-token>*, *number*, *string*]]

#### Parameters:

| Name    | Type     |
| ------- | -------- |
| `str`   | _string_ |
| `index` | _number_ |

**Returns:** [_number_, [*<number-token>*, *number*, *number* | *integer*] |
[*<percentage-token>*, *number*] | [*<dimension-token>*, *number*, *string*]]

Defined in:
[parse/lexicalAnalysis.ts:566](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L566)

---

### consumeString

??? `Const`**consumeString**(`str`: _string_, `index`: _number_): _null_ |
[*number*, *string*]

#### Parameters:

| Name    | Type     |
| ------- | -------- |
| `str`   | _string_ |
| `index` | _number_ |

**Returns:** [*number*, *string*]

Defined in:
[parse/lexicalAnalysis.ts:453](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L453)

---

### consumeUrl

??? `Const`**consumeUrl**(`str`: _string_, `index`: _number_): [*number*,
*string*]

#### Parameters:

| Name    | Type     |
| ------- | -------- |
| `str`   | _string_ |
| `index` | _number_ |

**Returns:** [*number*, *string*]

Defined in:
[parse/lexicalAnalysis.ts:773](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L773)

---

### lexicalAnalysis

??? `Const`**lexicalAnalysis**(`str`: _string_, `index?`: _number_): _null_ |
[_Token_](README.md#token)[]

#### Parameters:

| Name    | Type     | Default value |
| ------- | -------- | ------------- |
| `str`   | _string_ | -             |
| `index` | _number_ | 0             |

**Returns:** [_Token_](README.md#token)[]

Defined in:
[parse/lexicalAnalysis.ts:115](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L115)

---

### removeWhitespace

??? `Const`**removeWhitespace**(`tokenList`: [_Token_](README.md#token)[]):
WToken[]

#### Parameters:

| Name        | Type                         |
| ----------- | ---------------------------- |
| `tokenList` | [_Token_](README.md#token)[] |

**Returns:** WToken[]

Defined in:
[parse/syntacticAnalysis.ts:59](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L59)

---

### syntacticAnalysis

??? `Const`**syntacticAnalysis**(`tokenList`: [_Token_](README.md#token)[]):
[_MediaQuery_](README.md#mediaquery)[]

#### Parameters:

| Name        | Type                         |
| ----------- | ---------------------------- |
| `tokenList` | [_Token_](README.md#token)[] |

**Returns:** [_MediaQuery_](README.md#mediaquery)[]

Defined in:
[parse/syntacticAnalysis.ts:82](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L82)

---

### toAST

??? `Const`**toAST**(`str`: _string_): [_AST_](README.md#ast)

#### Parameters:

| Name  | Type     |
| ----- | -------- |
| `str` | _string_ |

**Returns:** [_AST_](README.md#ast)

Defined in:
[parse/syntacticAnalysis.ts:14](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L14)

---

### toUnflattenedAST

??? `Const`**toUnflattenedAST**(`str`: _string_): [_AST_](README.md#ast)

#### Parameters:

| Name  | Type     |
| ----- | -------- |
| `str` | _string_ |

**Returns:** [_AST_](README.md#ast)

Defined in:
[parse/syntacticAnalysis.ts:25](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L25)

---

### tokenizeMediaCondition

??? `Const`**tokenizeMediaCondition**(`tokens`: WToken[], `mayContainOr`:
_boolean_, `previousOperator?`: _and_ | _or_ | _not_): _null_ |
[_MediaCondition_](README.md#mediacondition)

#### Parameters:

| Name               | Type      | Default value |
| ------------------ | --------- | ------------- | ---- | ----- | ---- |
| `tokens`           | WToken[]  | -             |
| `mayContainOr`     | _boolean_ | -             |
| `previousOperator` | _null_    | _and_         | _or_ | _not_ | null |

**Returns:** [_MediaCondition_](README.md#mediacondition)

Defined in:
[parse/syntacticAnalysis.ts:229](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L229)

---

### tokenizeMediaFeature

??? `Const`**tokenizeMediaFeature**(`rawTokens`: WToken[]): _null_ |
[_MediaFeatureBoolean_](README.md#mediafeatureboolean) |
[_MediaFeatureValue_](README.md#mediafeaturevalue) |
[_MediaFeatureRange_](README.md#mediafeaturerange)

#### Parameters:

| Name        | Type     |
| ----------- | -------- |
| `rawTokens` | WToken[] |

**Returns:** [_MediaFeatureBoolean_](README.md#mediafeatureboolean) |
[_MediaFeatureValue_](README.md#mediafeaturevalue) |
[_MediaFeatureRange_](README.md#mediafeaturerange)

Defined in:
[parse/syntacticAnalysis.ts:347](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L347)

---

### tokenizeMediaQuery

??? `Const`**tokenizeMediaQuery**(`tokens`: WToken[]): _null_ |
[_MediaQuery_](README.md#mediaquery)

#### Parameters:

| Name     | Type     |
| -------- | -------- |
| `tokens` | WToken[] |

**Returns:** [_MediaQuery_](README.md#mediaquery)

Defined in:
[parse/syntacticAnalysis.ts:123](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L123)

---

### tokenizeRange

??? `Const`**tokenizeRange**(`tokens`: ConvenientToken[]): { `featureName`:
_string_ ; `leftOp`: _<_ | _<=_ ; `leftToken`:
[_ValidRangeToken_](README.md#validrangetoken) ; `rightOp`: _<_ | _<=_ ;
`rightToken`: [_ValidRangeToken_](README.md#validrangetoken) } | {
`featureName`: _string_ ; `leftOp`: _>_ | _>=_ ; `leftToken`:
[_ValidRangeToken_](README.md#validrangetoken) ; `rightOp`: _>_ | _>=_ ;
`rightToken`: [_ValidRangeToken_](README.md#validrangetoken) } | {
`featureName`: _string_ ; `leftOp`: _<_ | _<=_ | _>_ | _>=_ | _=_ ; `leftToken`:
[_ValidRangeToken_](README.md#validrangetoken) ; `rightOp`: _null_ ;
`rightToken`: _null_ } | { `featureName`: _string_ ; `leftOp`: _null_ ;
`leftToken`: _null_ ; `rightOp`: _<_ | _<=_ | _>_ | _>=_ | _=_ ; `rightToken`:
[_ValidRangeToken_](README.md#validrangetoken) }

#### Parameters:

| Name     | Type              |
| -------- | ----------------- |
| `tokens` | ConvenientToken[] |

**Returns:** { `featureName`: _string_ ; `leftOp`: _<_ | _<=_ ; `leftToken`:
[_ValidRangeToken_](README.md#validrangetoken) ; `rightOp`: _<_ | _<=_ ;
`rightToken`: [_ValidRangeToken_](README.md#validrangetoken) } | {
`featureName`: _string_ ; `leftOp`: _>_ | _>=_ ; `leftToken`:
[_ValidRangeToken_](README.md#validrangetoken) ; `rightOp`: _>_ | _>=_ ;
`rightToken`: [_ValidRangeToken_](README.md#validrangetoken) } | {
`featureName`: _string_ ; `leftOp`: _<_ | _<=_ | _>_ | _>=_ | _=_ ; `leftToken`:
[_ValidRangeToken_](README.md#validrangetoken) ; `rightOp`: _null_ ;
`rightToken`: _null_ } | { `featureName`: _string_ ; `leftOp`: _null_ ;
`leftToken`: _null_ ; `rightOp`: _<_ | _<=_ | _>_ | _>=_ | _=_ ; `rightToken`:
[_ValidRangeToken_](README.md#validrangetoken) }

Defined in:
[parse/syntacticAnalysis.ts:499](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/syntacticAnalysis.ts#L499)

---

### wouldStartIdentifier

??? `Const`**wouldStartIdentifier**(`str`: _string_, `index`: _number_): _boolean_

#### Parameters:

| Name    | Type     |
| ------- | -------- |
| `str`   | _string_ |
| `index` | _number_ |

**Returns:** _boolean_

Defined in:
[parse/lexicalAnalysis.ts:483](https://github.com/tbjgolden/media-query-parser/blob/e9a76d1/src/parse/lexicalAnalysis.ts#L483)
