// always default value is  today in datepicker
document.addEventListener("DOMContentLoaded", function (event) {
    document.getElementById("inputFirstDate").valueAsDate = new Date();

    // if url has parameters, values of form from url
    let data = location.search;
    if (data) {
        data = location.search.substring(1); // remove the '?'
        data = data.split('&');
        let pairs = {};
        for (let i = 0; i < data.length; i++) {
            let tmp = data[i].split('=');
            pairs[tmp[0]] = tmp[1];
        }
        let f = document.getElementById("creditForm");
        for (let i in pairs) {
            if (f.elements[i]) { f.elements[i].value = pairs[i]; }
        }
        clickSubmit();
    } else {

        // hide 2,3 blocks with calculations
        document.getElementById("totalSum").style.display = "none";
        document.getElementById("shedulePay").style.display = "none";
    }

});

// function of incoming value for transmission 
const creditCount = () => {
    // calculation 2,3 blocks visible
    document.getElementById("totalSum").style.display = "block";
    document.getElementById("shedulePay").style.display = "block";
    // get form values

    let inputSum = document.getElementById("inputSum");
    let inputTerm = document.getElementById("inputTerm");
    let inputPercent = document.getElementById("inputPercent");
    let inputFirstDate = document.getElementById("inputFirstDate");
    let selectType = document.getElementById("selectType");
    // transmission form values for function of create array
    return shedulePayment(inputSum.value, inputTerm.value, inputPercent.value, inputFirstDate.value, selectType.value),
        urlChangeAddParameters(inputSum, inputTerm, inputPercent, inputFirstDate, selectType);
};

// function monthly payment and total overpayment
const getPayment = (resultPayment, resultOverPayment) => {
    let payment = document.getElementById("payment");
    let overpayment = document.getElementById("overpayment");
    return payment.innerHTML = resultPayment, overpayment.innerHTML = resultOverPayment;
};

// function to build a payment schedule, to create object
const shedulePayment = (inputSum, inputTerm, inputPercent, inputFirstDate, selectType) => {
    let arrayShedule = new Array();
    let prevMainDept = 0;
    let resultPayment;
    let resultOverPayment;
    // monthly interest rate
    let koef = inputPercent / 12 / 100;
    //if annuity payment - count the monthly payment and the total overpayment for 2 block
    if (selectType == 1) {
        // monthly payment by formula of annuity, then rounding value
        if (inputPercent > 0) {
            resultPayment = (inputSum * (koef * ((1 + koef) ** inputTerm)) / (((1 + koef) ** inputTerm) - 1)).toFixed(2);
        } else {
            resultPayment = (inputSum / inputTerm).toFixed(2);
        }
        // calculating overpayment, then rounding value
        resultOverPayment = numberFormat((resultPayment * inputTerm - inputSum).toFixed(2));
    }
    // variable is needed to calculate the  differential payment
    let diffTotalPayment = 0;
    for (let i = 0; i < Number(inputTerm); i++) {
        let sheduleObject = new Object();
        let d = new Date(inputFirstDate);
        d.setMonth(d.getMonth() + i);
        //add properties and values to Object
        sheduleObject.id = i + 1;
        sheduleObject.date = formatDate(d);
        //if annuity payment
        if (selectType == 1) {
            if (arrayShedule[i - 1] && arrayShedule[i - 1].mainDebt) {
                prevMainDept += Number(arrayShedule[i - 1].mainDebt);
            }
            let percentSumMonth = ((inputSum - prevMainDept) * koef).toFixed(2);
            sheduleObject.monthPayment = resultPayment;
            sheduleObject.mainDebt = (resultPayment - percentSumMonth).toFixed(2);
            sheduleObject.percent = percentSumMonth;
        }
        // differentiated payment
        else if (selectType == 2) {
            let mainDebt = Number((inputSum / inputTerm));
            resultPayment = Number((mainDebt + (inputSum - (mainDebt * i)) * koef).toFixed(2));
            diffTotalPayment += resultPayment;
            sheduleObject.monthPayment = resultPayment;
            sheduleObject.mainDebt = mainDebt.toFixed(2);
            sheduleObject.percent = (resultPayment - mainDebt).toFixed(2);
        }
        sheduleObject.residual = (resultPayment * inputTerm - resultPayment * (i + 1)).toFixed(2);
        arrayShedule.push(sheduleObject);
    }
    // differentiated payment - count the monthly payment and the total overpayment for 2 block
    if (selectType == 2) {
        resultPayment = numberFormat(arrayShedule[0].monthPayment) + ' ... ' + numberFormat(arrayShedule[arrayShedule.length - 1].monthPayment);
        resultOverPayment = numberFormat((diffTotalPayment - inputSum).toFixed(2));
    } else {
        resultPayment = numberFormat(resultPayment);
    }
    return getPayment(resultPayment, resultOverPayment), createTable(arrayShedule);
}

// function create table
const createTable = (arrayShedule) => {
    let table = document.getElementById("sheduleTable").getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    // create row equally term in months
    for (let i = 0; i < arrayShedule.length; i++) {
        let row = table.insertRow(i);
        // create td in row , quallity td equally values of Object
        for (let j = 0; j < Object.keys(arrayShedule[i]).length; j++) {
            let cell = row.insertCell(j);
            if (j <= 1) {
                cell.innerHTML = Object.values(arrayShedule[i])[j];
            } else {
                cell.innerHTML = numberFormat(Object.values(arrayShedule[i])[j]);
            }
        }
    }
}

// function format date for shedule-table
const formatDate = (date) => {
    let monthNames = [
        "Январь", "Февраль", "Март",
        "Апрель", "Май", "Июнь", "Июль",
        "Август", "Сентябрь", "Октябрь",
        "Ноябрь", "Декабрь"
    ];
    let monthIndex = date.getMonth();
    let year = date.getFullYear();
    return monthNames[monthIndex] + ', ' + year;
}

// submit event on input event in field of form
const clickSubmit = () => {
    let button = document.getElementById("calcButton");
    button.click();
}

// function format number triada
const numberFormat = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// function change url with parameters 
const urlChangeAddParameters = (inputSum, inputTerm, inputPercent, inputFirstDate, selectType) => {
    let newSearch = '?' + inputSum.name + '=' + inputSum.value + '&'
        + inputTerm.name + '=' + inputTerm.value + '&'
        + inputPercent.name + '=' + inputPercent.value + '&'
        + inputFirstDate.name + '=' + inputFirstDate.value + '&'
        + selectType.name + '=' + selectType.value;
    window.history.replaceState({}, window.location.search, newSearch);
}

// function onclick copy Url with parameters to clipboard
const copyUrl = () => {
    let urlLink = window.location.toString();
    navigator.clipboard.writeText(urlLink).then(function () {
        console.log("Async: копирование в буфер обмена было успешным!");
    }, function (err) {
        console.error('Async: не удалось скопировать текст:', err);
    });
}