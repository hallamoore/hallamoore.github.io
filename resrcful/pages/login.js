import { setCookie } from "../cookies.js";

export default {
  build() {
    const div = document.createElement("div");
    div.innerHTML = `
      Username: <input id="username"/>
      <br/>
      Password: <input id="password" type="password"/>
      <br/>
    `;
    const submit = document.createElement("button");
    submit.textContent = "Login";
    submit.onclick = async () => {
      const resp = await fetch(
        "https://script.google.com/macros/s/AKfycbzbR2Yzje3mVygJnsMm0Mr8D2bSnYXGOwZFZnjhFfg8HcjMj8yBpFZq-S_giOTtg57M/exec",
        {
          method: "POST",
          body: JSON.stringify({
            action: "login",
            actionArgs: [
              document.getElementById("username").value,
              document.getElementById("password").value,
            ],
          }),
        }
      );
      const data = await resp.json();
      if (!data.session) {
        console.log(data);
      } else {
        setCookie("resrcfulSession", data.session);
        location.href = `${location.origin}/resrcful`;
      }
    };
    div.appendChild(submit);
    return div;
  },
};
