import{i as s,a as f,x as p}from"./CheckoutPage-DZ_ygq-k.js";import{c as a}from"./if-defined-gwtVsJtc.js";import"./index-BX6W4CeC.js";import"./index-Bec3TPEE.js";import"./invoiceUtils-B0PNg78l.js";import"./shield-check-BZJZMYaB.js";import"./credit-card-Bme0e66l.js";import"./file-text-DtO5gUHP.js";import"./index-4h7cZe3P.js";import"./index-CvIrorsi.js";import"./index-BL6k-Ibl.js";import"./index-BPAzrPyv.js";import"./index-DtV0hszg.js";const d=s`
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
