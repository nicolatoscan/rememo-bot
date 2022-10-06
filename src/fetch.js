const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
process.env.JWT_DUOLINGO

async function get() {

    const x = await fetch("https://www.duolingo.com/api/1/users/show?id=361457804", {
        "headers": {
            "cookie": `jwt_token=${process.env.JWT_DUOLINGO}`
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
    });
    const res = await x.json()
    fs.writeFileSync('userdata.json', JSON.stringify(res, null, 2))
    console.log('Done')
}
get()