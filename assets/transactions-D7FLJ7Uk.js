import{i as s,a as f,x as p}from"./CheckoutPage-BbPuYy7J.js";import{c as a}from"./if-defined-CjZbSjNX.js";import"./index-hL-N1mb4.js";import"./index-CD3dpuQt.js";import"./invoiceUtils-ndWwt8B0.js";import"./shield-check-C6ZA-_4O.js";import"./credit-card-QasLS78r.js";import"./file-text-C2eEYNqV.js";import"./index-ylBcojj-.js";import"./index-A45Q7ZBK.js";import"./index-Ppx9Fnk5.js";import"./index-Bgi8oXAw.js";import"./index-Bv2Qio8Q.js";const d=s`
  :host > wui-flex:first-child {
    height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }
`;var u=function(o,i,e,r){var n=arguments.length,t=n<3?i:r===null?r=Object.getOwnPropertyDescriptor(i,e):r,l;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(o,i,e,r);else for(var m=o.length-1;m>=0;m--)(l=o[m])&&(t=(n<3?l(t):n>3?l(i,e,t):l(i,e))||t);return n>3&&t&&Object.defineProperty(i,e,t),t};let c=class extends f{render(){return p`
      <wui-flex flexDirection="column" .padding=${["0","m","m","m"]} gap="s">
        <w3m-activity-list page="activity"></w3m-activity-list>
      </wui-flex>
    `}};c.styles=d;c=u([a("w3m-transactions-view")],c);export{c as W3mTransactionsView};
