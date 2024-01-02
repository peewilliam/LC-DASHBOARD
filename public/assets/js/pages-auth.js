"use strict";
const formAuthentication = document.querySelector("#formAuthentication");
document.addEventListener("DOMContentLoaded", function (e) {
 var t;
 formAuthentication &&
  FormValidation.formValidation(formAuthentication, {
   fields: {
    username: {
     validators: {
      notEmpty: { message: "Por favor, insira seu usuário!" },
      stringLength: {
       min: 4,
       message: "Username must be more than 4 characters",
      },
     },
    },
    email: {
     validators: {
      notEmpty: { message: "Por favor, insira seu usuário!" },
      emailAddress: { message: "Insira m usuário válido!" },
     },
    },
    "email-username": {
     validators: {
      notEmpty: { message: "Por favor, insira seu usuário!" },
      stringLength: {
       min: 4,
       message: "Seu usuário precisa ter mais de 4 caracteres!",
      },
     },
    },
    password: {
     validators: {
      notEmpty: { message: "Por favor, insira sua senha!" },
      stringLength: {
       min: 4,
       message: "Sua senha tem que tem mais de 4 caracteres",
      },
     },
    },
    "confirm-password": {
     validators: {
      notEmpty: { message: "Please confirm password" },
      identical: {
       compare: function () {
        return formAuthentication.querySelector('[name="password"]').value;
       },
       message: "The password and its confirm are not the same",
      },
      stringLength: {
       min: 4,
       message: "Password must be more than 4 characters",
      },
     },
    },
    terms: {
     validators: { notEmpty: { message: "Please agree terms & conditions" } },
    },
   },
   plugins: {
    trigger: new FormValidation.plugins.Trigger(),
    bootstrap5: new FormValidation.plugins.Bootstrap5({
     eleValidClass: "",
     rowSelector: ".mb-3",
    }),
    submitButton: new FormValidation.plugins.SubmitButton(),
    defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
    autoFocus: new FormValidation.plugins.AutoFocus(),
   },
   init: (e) => {
    e.on("plugins.message.placed", function (e) {
     e.element.parentElement.classList.contains("input-group") &&
      e.element.parentElement.insertAdjacentElement(
       "afterend",
       e.messageElement
      );
    });
   },
  }),
  (t = document.querySelectorAll(".numeral-mask")).length &&
   t.forEach((e) => {
    new Cleave(e, { numeral: !0 });
   });
});
