//Code to initialize and render the Universal Checkout with Primer SDK

import { loadPrimer } from '@primer-io/checkout-web'
import '@primer-io/checkout-web/dist/Checkout.css'

const PrimerPromise = loadPrimer()

window.addEventListener("load", onLoaded);

async function onLoaded() {

  const Primer = await PrimerPromise;
  const clientTokenResponse = await fetch("/client-token", {
    method: "post",
    headers: { "Content-Type": "application/json" },
  });
  const clientTokenPayload = await clientTokenResponse.json();

  const clientToken = clientTokenPayload.clientToken;

  const primer = new Primer({
    credentials: {
      clientToken, // Your server generated client token
    },
  });

  const checkoutOptions = {

    container: "#checkout-container",

    locale: "US",

    card: {
      cardholderName: {
        visible: false
      }
    },


    // Called after a payment method is tokenized
    // Checkout stays in loading state until this Promise is resolved or rejected
    async onTokenizeSuccess(paymentMethod) {

      // Send the Payment Method Token to your server
      // to create a payment using Payments API
      const response = await fetch("/authorize", {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentMethod)
        });

        const json_response = await response.json();

        // If a new clientToken is available, resolve the Promise to refresh the client session.
        // The checkout will automatically perform the action required by the Workflow (for ex 3DS).
        if (typeof json_response.requiredAction !== "undefined") {
          return { clientToken: json_response.requiredAction.clientToken }
        }

        // Else check the payment success
        else if (json_response.status === "AUTHORIZED" || json_response.status === "SETTLING") {

          // Display the success screen
          return true
        }

    },
    
    // Called after extra steps like 3DS are completed
    // Checkout stays in loading state until this Promise is resolved or rejected
    async onResumeSuccess(data) {
        
          // Send the resume token to your server to resume the payment
          const response = await fetch("/resume", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });

          const json_response = await response.json();

          // If a new clientToken is available, resolve the Promise with it to refresh the client session
          // The checkout will automatically perform the action required by the Workflow
          if (typeof json_response.requiredAction !== "undefined") {
            return { clientToken: json_response.requiredAction.clientToken }
          }

          // Else check the payment success
          else if (json_response.status === "AUTHORIZED" || json_response.status === "SETTLING") {

            // Display the success screen
            return true
          }

    },

    successScreen: {
      type: 'CHECK',
      title: 'Thank you for your order!',
    }

  }

  // Use `.checkout()` to initialize and render the UI
  await primer.checkout(checkoutOptions)
}
