// Doi tuong
function Validator(options) {
    // Tìm cha của thẻ input
    function getParent(element, name) {
        while (element.parentElement) {
            if (element.parentElement.matches(name)) {
                return element.parentElement;
            } else {
                element = element.parentElement;
            }
        }
        return null;
    }

    var selectorRules = {};
    // ham thuc hien validate
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng rule & kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case "radio":
                case "checkbox":
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ":checked"));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
                    break;
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            getParent(inputElement, options.formGroupSelector).classList.add("invalid");
            errorElement.innerText = errorMessage;
        } else {
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
            errorElement.innerText = "";
        }
        return !errorMessage;
    }

    // lay element cua form can thuc hien validate
    var formElement = document.querySelector(options.form);
    if (formElement) {
        // xu ly submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);

                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // Trường hợp submit với javascript
                if (typeof options.onSubmit === "function") {
                    var enableInputs = formElement.querySelectorAll("[name]");
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                            case "radio":
                                if (input.matches(":checked")) {
                                    values[input.name] = input.value;
                                }
                                break;
                            case "checkbox":
                                if (!input.matches(":checked")) {
                                    values[input.name] = "";
                                    return values;
                                }

                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);

                                break;
                            case "file":
                                values[input.name] = input.files[0];
                                break;
                            default:
                                values[input.name] = input.value;
                                break;
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            }
        };

        // lắp qua mỗi rule và xử lý
        options.rules.forEach(function (rule) {
            //lưu lại các rule cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {
                // xu ly th blur khoi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                };
                // xu ly khi nhap vao input
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(
                        options.errorSelector
                    );
                    getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
                    errorElement.innerText = "";
                };
            });
        });
    }
}

// Dinh nghia cac rules
Validator.isRequired = function (selector, message) {
    return {
        selector,
        test: function (value) {
            return value ? undefined : message || "Vui lòng nhập trường này!";
        },
    };
};
Validator.isFullName = function (selector, message) {
    return {
        selector,
        test: function (value) {
            return value.trim() ? undefined : message || "Vui lòng nhập trường này!";
        },
    };
};
Validator.isEmail = function (selector, message) {
    return {
        selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || "Vui lòng nhập đúng định dạng Email";
        },
    };
};

Validator.isPassword = function (selector, message) {
    return {
        selector,
        test: function (value) {
            var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
            return passw.test(value)
                ? undefined
                : message ||
                      "Mật khẩu từ 6 đến 20 ký tự, trong đó có ít nhất một chữ số, một chữ hoa và một chữ thường";
        },
    };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || "Giá trị nhập vào không khớp!";
        },
    };
};
