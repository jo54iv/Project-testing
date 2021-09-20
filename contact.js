/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use strict';

import 'magnific-popup';

let contact = {
    interests: null,
    form: () => {

        grecaptcha.ready(function() {
            grecaptcha.execute('only-for-production-key-will-go-here', {action: 'contact_form'}).then(function(token) {
                document.getElementById('g-recaptcha-response').value = token;
            });
        });
        contact.interests = new vanillaSelectBox('#interests', {
            placeHolder: 'Please Select all that apply',
        });

        $('#contact-form').submit(function (e) {
            e.preventDefault();

            var formData = new FormData($(this)[0]);

            var object = {};
            formData.forEach((value, key) => {
                // Reflect.has in favor of: object.hasOwnProperty(key)
                if (!Reflect.has(object, key)) {
                    object[key] = value;
                    return;
                }
                if (!Array.isArray(object[key])) {
                    object[key] = [object[key]];
                }
                object[key].push(value);
            });


            var json = JSON.stringify(object);


            var dataObject = {
                'action': 'nona_contact_form',
                'security': AJAX_NONCE,
                'data': object,
            };

            $.ajax({
                type: 'post',
                url: AJAX_URL,
                data: dataObject,
                dataType: 'json',
                success: function (response) {
                    console.log(response);
                    if (response.success) {
                        $('#contact-form')[0].reset();
                        contact.interests.empty();

                        $.magnificPopup.open({
                            items: {
                                src: '#thanks-popup',
                            },
                            type: 'inline',
                        });


                    } else {
                        $.magnificPopup.open({
                            items: {
                                src: '#error-popup',
                            },
                            type: 'inline',
                        });
                    }



                },
            });

        });
    },
};

$(function () {
    contact.form();
    $('#clear-form').on('click', () => {
        $('#contact-form')[0].reset();
        contact.interests.empty();
    });
});
