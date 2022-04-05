document.addEventListener('DOMContentLoaded', onLoad, false);

function getNode(elementName) {
    return document.getElementById(elementName);
}

const nodeNames = [
    "appId",
    "state",
    "redirectUri",
    "clientId",
    "clientSecret"]

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
        const url = `https://sellercentral-europe.amazon.com/apps/authorize/consent?application_id=${localStorage.getItem("appId")}&state=${localStorage.getItem("state")}&version=beta`
        location.href = url;
    }

    const params = new URLSearchParams(location.search);
    const requiredParams = ["state", "selling_partner_id", "spapi_oauth_code"]
    if (requiredParams.every(param => params.has(param))) {
        if (params.get("state") === localStorage.getItem("state")) {
            const sellerId = params.get("selling_partner_id");

            const code = params.get("spapi_oauth_code");
            const redirectUri = localStorage.getItem("redirectUri");
            const clientId = localStorage.getItem("clientId");
            const clientSecret = localStorage.getItem("clientSecret");
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

