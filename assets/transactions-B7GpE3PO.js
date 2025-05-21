import{i as s,a as f,x as p}from"./CheckoutPage-uGMkkPqh.js";import{c as a}from"./if-defined-DXMzVV2F.js";import"./index-DCnJ9T6z.js";import"./index-BEflyWce.js";import"./invoiceUtils-B0TVVeCI.js";import"./gamepad-2-0Ohojrqc.js";import"./shield-check-9UZ7BKPc.js";import"./file-text-Cdaxyqjr.js";import"./index-vauPvAvO.js";import"./index-ByUAKbC9.js";import"./index-zCQpuEIf.js";import"./index-DkE1C5hL.js";import"./index-2cW0Qfv4.js";const d=s`
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
