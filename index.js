document.addEventListener('DOMContentLoaded', onLoad, false);

function getNode(elementName) {
    return document.getElementById(elementName);
}

const nodeNames = [
    "amazonAuthUrl",
    "appIdValue",
    "stateValue",
    "redirectUriValue",
    "clientIdValue",
    "clientSecretValue"
]

function onLoad() {

    nodeNames.forEach(name => {
        const node = getNode(name);
        node.onchange = (e) => {
            const val = e.target.value;
            localStorage.setItem(name, val);
        }
        node.value = localStorage.getItem(name);
    })

    submitButton.onclick = () => {
        // const url = `https://sellercentral.amazon.com/apps/authorize/consent?application_id=${localStorage.getItem("appId")}&state=${localStorage.getItem("state")}&version=beta`
        const authUrl = localStorage.getItem("amazonAuthUrl");
        const appId = localStorage.getItem("appIdValue");
        const state = localStorage.getItem("stateValue");
        console.log(appId, state);
        const url = `${authUrl}/apps/authorize/consent?application_id=${appId}&state=${state}&version=beta`
        location.href = url;
    }

    const params = new URLSearchParams(location.search);
    const requiredParams = ["state", "selling_partner_id", "spapi_oauth_code"]
    if (requiredParams.every(param => params.has(param))) {
        if (params.get("state") === localStorage.getItem("stateValue")) {
            const sellerId = params.get("selling_partner_id");

            const code = params.get("spapi_oauth_code");
            const redirectUri = localStorage.getItem("redirectUriValue");
            const clientId = localStorage.getItem("clientIdValue");
            const clientSecret = localStorage.getItem("clientSecretValue");
            console.log(code, redirectUri, clientId, clientSecret);
            const url = `https://api.amazon.com/auth/o2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}&client_id=${clientId}&client_secret=${clientSecret}`;

            const http = new XMLHttpRequest();
            http.open("POST", url);
            http.send();
            http.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        result = sellerId + "<br />" + http.responseText + "<br />";
                        resultText.innerHTML = result;
                    } else {
                        result = sellerId + "<br />" + "status " + this.status + ", " + http.responseText + "<br />";
                        resultText.innerHTML = result;
                    }
                } else {
                    console.log("response state", this.readyState);
                }
            }
        } else {
            console.log("fail - bad state");
        }
    } else {
        console.log("unmatched query");
    }

}

/*

NOTES:

1)
click -> auth url (redirect_uri, state) // state = temporary token (5m TTL)

	https://sellercentral.amazon.com/apps/authorize/consent?application_id=appidexample&state=stateexample&version=beta
	OR
	https://sellercentral.amazon.com/apps/authorize/consent?application_id=appidexample&state=stateexample

2)

user stuff on seller central

3)

-> redirect uri?state=W&selling_partner_id=X&mws_auth_token=Y&spapi_oauth_code=Z

	find doc by state
	save spID, mws auth token (idk why), sp api oauth code

4)

eve
-> https://api.amazon.com/auth/o2/token?grant_type=authorization_code&code={W}&redirect_uri={X}&client_id={Y}&client_secret={Z}

	W is from 3)
	X is our URL
	Y is from our creds
	Z is from our creds

 <-

in JSON body:
	access_token
	token_type
	expires_in
	refresh_token

save refresh_token

show user that it succeeded

-------------------------------------

auth urls - https://github.com/amzn/selling-partner-api-docs/blob/main/guides/en-US/developer-guide/SellingPartnerApiDeveloperGuide.md#Seller-Central-URLs

Seller Central URLs
For seller applications only

Here are the Seller Central URLs by marketplace.

North America

Marketplace	Seller Central URL
Canada		https://sellercentral.amazon.ca
US		    https://sellercentral.amazon.com
Mexico		https://sellercentral.amazon.com.mx
Brazil		https://sellercentral.amazon.com.br

Europe

Marketplace	Seller Central URL
Spain		https://sellercentral-europe.amazon.com
UK		    https://sellercentral-europe.amazon.com
France		https://sellercentral-europe.amazon.com
Netherlands	https://sellercentral.amazon.nl
Germany	    https://sellercentral-europe.amazon.com
Italy		https://sellercentral-europe.amazon.com
Sweden		https://sellercentral.amazon.se
Poland		https://sellercentral.amazon.pl
Turkey		https://sellercentral.amazon.com.tr
U.A.E.		https://sellercentral.amazon.ae
India		https://sellercentral.amazon.in

Far East

Marketplace	Seller Central URL
Singapore	https://sellercentral.amazon.sg
Australia	https://sellercentral.amazon.com.au
Japan		https://sellercentral.amazon.co.jp
* */

