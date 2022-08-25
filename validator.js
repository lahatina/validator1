// Đối tượng Validator
function Validator(options) {

  const selectorRules = {};

  // hàm thực hiên validate
  function validate(inputElement, rule) {
    const elementParent = inputElement.closest(options.formGroupSelector);
    const errorElement = elementParent.querySelector(options.errorSelector);
    
    let errorMessage;

    // Lấy ra các rules của  selector
    let rules = selectorRules[rule.selector];

    // Lặp qua từng rule và kiểm tra
    // Nếu có lỗi(nhập sai) xảy ra thì dừng kiểm tra
    for (let i = 0; i < rules.length; ++i) {
      switch (inputElement.type) {
        case 'radio':
        case 'checkbox':
      errorMessage = rules[i](
        formElement.querySelector(rule.selector + ':checked')
      );
          break;
        default:
      errorMessage = rules[i](inputElement.value);

      }
      if (errorMessage) break;
      
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      const elementParent = inputElement.closest(options.formGroupSelector).classList.add("invalid");
    } else {
      errorElement.innerText = "";
      const elementParent = inputElement.closest(options.formGroupSelector).classList.remove("invalid");
    }
    return !errorMessage;
  }
  // lấy ra element của form cần validate
  const formElement = document.querySelector(options.form);
  if (formElement) {
    // Khi submit form
    formElement.onsubmit = (e) => {
      e.preventDefault();

      var isFormValid = true;

      // Lặp qua từng rules và validate luôn
      options.rules.forEach((rule) => {
        const inputElement = formElement.querySelector(rule.selector);
        const isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });
      if (isFormValid) {
        // Trường hợp submit bằng javascript
        if (typeof options.onSubmit === 'function') {
          const enableInputs = formElement.querySelectorAll('[name]');
          const formValues = Array.from(enableInputs).reduce((values, input) => {
            switch (input.type) {
              case 'radio':
                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                break;
              case 'checkbox':
                if (!input.matches(':checked')) {
                  values[input.name] = '';
                  return values;
                }
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }
                values[input.name].push(input.value);
                break;
              case 'file':
                values[input.name] = input.files;
                break;
              default:
                values[input.name] = input.value;
            }
            
            return values;
          }, {});
          options.onSubmit(formValues);
        } 
        // submit với hành vi mặc đinh
        else {
          formElement.submit();
        }
      }
    }

    // Lặp qua từng rules và xử lý chúng( lắng nghe event, onblur, input...)
    options.rules.forEach((rule) => {
      // Lưu lại các rules cho các ô input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }
      const inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach((inputElement) => {
        // xử lý khi người dùng blur chuột khỏi ô input
        inputElement.onblur = () => {
          validate(inputElement, rule);
        };
        // xử lý khi người dùng nhập gì đó vào ô input
        inputElement.oninput = () => {
          const errorElement = inputElement.closest(options.formGroupSelector).querySelector(options.errorSelector);
          errorElement.innerText = "";
          inputElement.closest(options.formGroupSelector).classList.remove("invalid");
        };
      });

      
    });
  }
}
// Định nghĩa các rules
// Nguyên tắc của các rules:
// 1. khi nhập sai => hiện messages lỗi
// 2. khi nhâp đúng => ko hiện gì
Validator.isRequired = (selector, message) => {
  return {
    selector: selector,
    test: (value) => {
      return value ? undefined : message || "Vui lòng nhập vào trường này";
    }
  };
}

Validator.isEmail = (selector, message) => {
  return {
    selector: selector,
    test: (value) => {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : message || "Trường này phải là email?";
    }
  };
}
Validator.minLength = (selector, min, message) => {
    return {
      selector: selector,
      test: (value) => {
        return value.length >= min ? undefined : message || `Mật khẩu phải nhiều hơn ${min} ký tự`;
      }
    };
  }

  Validator.isConfirmed = (selector, getConfirmValue, message) => {
    return {
      selector: selector,
      test: (value) => {
        return value === getConfirmValue() ? undefined : message || 'Gía trị nhập vào không chính xác';
      }
    };
  }
