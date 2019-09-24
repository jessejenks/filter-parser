function tokenizerTest() {
    const myTokenizer = new Tokenizer(["nice", "cool", "ok", "wow", "neat", "computer science"]);

    function testOnInput(input) {
        myTokenizer.setInput(input)
        let count = 0;
        while(count < 50 && !myTokenizer.eof()) {
            console.log(myTokenizer.next());
            count ++;
        }
    }

    const tests = [
        // "nice and cool or not neat and $DATE after 09-01-2019 and $DATE before $TODAY",
        // `ok and neat or not wow and
        // ($DATE is 03-14-2019)
        // or
        // ($DATE is $TODAY)`,

        // "nice and unknown symbols and wow",

        // "0 < 2 and 2 < 3 or 3 < 5",

        // "0 < 2 and 2 <= 3 or 3 >= 5",


        // "0 < 2 and (2 <= 3 or 3 >= 5)",

        // "0 < 2 and (2 <= 3 or 332 >= 5) and 3.14 is $PI",

        // "0 < 2 and (2 <= 3 or 332 >= 5) and 03-01-19999",

        'nice and ("cool" or ok) or "computer science"',
        'nice and cool or true'
    ];

    for (let test of tests) {
        console.log(`testing on '${test}'`)
        testOnInput(test);
        console.log('\n\n')
    }
}

function parserTest() {
    const myParser = new FilterParser(["nice", "cool", "ok", "wow", "neat"]);

    let parse;
    function testOnInput(input) {
        myParser.setInput(input)
        parse = myParser.parse();

        console.log(JSON.stringify(parse, null, 4));
        console.log(parseTreeToHtml(parse));
    }

    const tests = [
        // "nice and cool or not neat and $DATE after 09-01-2019 and $DATE before $TODAY",
        // `ok and neat or not wow and
        // ($DATE is 03-14-2019)
        // or
        // ($DATE is $TODAY)`,

        // "nice and unknown symbols and wow",
        // "9 < 4",

        // "0 < 2 and 2 < 3 or 3 < 5",

        // "0 < 2 and 2 <= 3 or 3 >= 5",


        // "0 < 2 and (2 <= 3 or 3 >= 5)",

        // "0 < 2 and (2 <= 3 or 332 >= 5) and 3.14 is $PI",

        // "0 < 2 and (2 <= 3 or 332 >= 5) and 03-01-19999",

        'nice and "ok" and true'
    ];

    for (let test of tests) {
        console.log(`testing on '${test}'`)
        testOnInput(test);
        console.log('\n\n')
    }   
}

parserTest();