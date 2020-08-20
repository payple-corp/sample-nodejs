const express = require('express')
const bodyParser = require('body-parser')
const { get } = require('axios')
const { post } = require('axios')
const ejs = require('ejs')
const { randomBytes } = require('crypto')

require('json-dotenv')()


const app = express()


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(`${__dirname}/dist`))


/*
 * 주문내역 입력
 */
app.get('/order', (req, res) => { // order api

//    const random = parseInt(randomBytes(8).toString('hex'), 16)
    let now_date = new Date()
		now_year = now_date.getFullYear()
		now_month = now_date.getMonth() + 1
		now_month = (now_month < 10) ? '0' + now_month : now_month
		now_day = now_date.getDate()
		now_day = (now_day < 10) ? '0' + now_day : now_day
		now_h = now_date.getHours()
		now_h = (now_h < 10) ? '0' + now_h : now_h
		now_i = now_date.getMinutes()
		now_i = (now_i < 10) ? '0' + now_i : now_i
		now_hi = parseInt(now_h + '' + now_i)
		datetime = now_date.getTime()
    
    const oid = 'test_' + now_year + now_month + now_day + datetime
    
    let data = {
            buyer_no : 2335,
            buyer_name : '홍길동',
            buyer_hp : '01012345678',
            buyer_email : 'help@payple.co.kr',
            buy_goods : '휴대폰',
            buy_total : '1000',
            order_num : oid
        },
        opts = {}

    ejs.renderFile(__dirname + '/ejs/order.html', data, opts, (err, str) => !err && res.send(str))


})


/*
 * 결제창 호출 페이지
 */
app.post('/confirm', (req, res) => { // order confirm api

    let { 
            pcd_cpay_ver, is_direct,
            pay_type, work_type, card_ver, payple_payer_id,
            buyer_no, buyer_name, buyer_hp, buyer_email,
            buy_goods, buy_total, buy_istax, buy_taxtotal, 
            order_num, pay_year, pay_month,
            is_reguler, is_taxsave, simple_flag, auth_type
        } = req.body,
        data = {
            pcd_cpay_ver : pcd_cpay_ver || '',
            is_direct : is_direct || '',
            pay_type : pay_type || '',
            work_type : work_type || '',
            card_ver : card_ver || '',
            payple_payer_id : payple_payer_id || '',
            buyer_no : buyer_no || '',
            buyer_name : buyer_name || '',
            buyer_hp : buyer_hp || '',
            buyer_email : buyer_email || '',
            buy_goods : buy_goods || '',
            buy_total : buy_total || '',
            buy_istax : buy_istax || '',
            buy_taxtotal : buy_taxtotal || '',
            order_num : order_num || '',
            pay_year : pay_year || '',
            pay_month : pay_month || '',
            is_reguler : is_reguler || false,
            is_taxsave : is_taxsave || false,
            simple_flag : simple_flag || false,
            auth_type : auth_type || ''
        },
        opts = {}


    ejs.renderFile(__dirname + '/ejs/order_confirm.html', data, opts, (err, str) => !err && res.send(str))


})

/*
 * 결제(인증)결과 수신 페이지
 */
app.post('/result', (req, res) => { // order result response
//    console.log(req.body);
    let {
           PCD_PAY_RST, PCD_PAY_MSG,
           PCD_PAY_OID, PCD_PAY_TYPE, PCD_PAY_WORK,
           PCD_PAYER_ID, PCD_PAYER_NO, PCD_PAYER_EMAIL,
           PCD_REGULER_FLAG, PCD_PAY_YEAR, PCD_PAY_MONTH,
           PCD_PAY_GOODS, PCD_PAY_TOTAL, PCD_PAY_TIME,
           PCD_TAXSAVE_RST, PCD_AUTH_KEY,
           PCD_PAY_REQKEY, PCD_PAY_COFURL
        } = req.body,
        data = {
           PCD_PAY_RST : PCD_PAY_RST || '',
           PCD_PAY_MSG : PCD_PAY_MSG || '',
           PCD_PAY_OID : PCD_PAY_OID || '',
           PCD_PAY_TYPE : PCD_PAY_TYPE || '',
           PCD_PAY_WORK : PCD_PAY_WORK || '',
           PCD_PAYER_ID : PCD_PAYER_ID || '',
           PCD_PAYER_NO : PCD_PAYER_NO || '',
           PCD_PAYER_EMAIL : PCD_PAYER_EMAIL || '',
           PCD_REGULER_FLAG : PCD_REGULER_FLAG || '',
           PCD_PAY_YEAR : PCD_PAY_YEAR || '',
           PCD_PAY_MONTH : PCD_PAY_MONTH || '',
           PCD_PAY_GOODS : PCD_PAY_GOODS || '',
           PCD_PAY_TOTAL : PCD_PAY_TOTAL || '',
           PCD_PAY_TIME : PCD_PAY_TIME || '',
           PCD_TAXSAVE_RST : PCD_TAXSAVE_RST || '',
           PCD_AUTH_KEY : PCD_AUTH_KEY || '',
           PCD_PAY_REQKEY : PCD_PAY_REQKEY || '',
           PCD_PAY_COFURL : PCD_PAY_COFURL || ''
        },
        opts = {}
    
    ejs.renderFile(__dirname + '/ejs/order_result.html', data, opts, (err, str) => !err && res.send(str))
    
})


/*
 * 환불요청 페이지
 */
app.get('/refundReq', (req, res) => {
    
    let data = {},
    opts = {}
    
    ejs.renderFile(__dirname + '/ejs/refundReq.html', data, opts, (err, str) => !err && res.send(str))
})

/*
 * 가맹점인증 요청 REST
 */
app.post('/auth', (req, res) => {

    /* 
     * process.env.URL
     * DEV  : http://dev.testcpay.payple.kr/php/auth.php
     * TEST : https://testcpay.payple.kr/php/auth.php
     * REAL : https://cpay.payple.kr/php/auth.php 
     */
    let url = process.env.URL,
        params = {
            cst_id  : process.env.CST_ID || '',
            custKey : process.env.CUST_KEY || ''
        }


    post(url, JSON.stringify(params), {
            headers: {
                'content-type': 'application/json',
                'referer': process.env.PCD_HTTP_REFERER
            }
        })
        .then(r => res.json( {  ...r.data }))
        .catch(err => console.error(err))
    /**
     * return json
    {
        "result": "success",
        "result_msg": "사용자 인증 완료!!",
        "cst_id": "test",
        "custKey": "abcd1234567890",
        "AuthKey": "fc63fe1ed0016321a666b1a9c0b6f68d9d5e4ff5c57e448314ba3352da59f1a7",
        "return_url": "https://testcpay.payple.kr/index.php?ACT_=PAYM"
    }
    */

})


/*
 * 환불요청 페이지
 */
app.get('/refundReq', (req, res) => {
    
    let data = {},
    opts = {}
    
    ejs.renderFile(__dirname + '/ejs/refundReq.html', data, opts, (err, str) => !err && res.send(str))
})





/*
 * 가맹점인증 요청 REST
 */
app.post('/auth', (req, res) => {

    /* 
     * process.env.URL
     * DEV  : http://dev.testcpay.payple.kr/php/auth.php
     * TEST : https://testcpay.payple.kr/php/auth.php
     * REAL : https://cpay.payple.kr/php/auth.php 
     */
    let url = process.env.URL,
        params = {
            cst_id  : process.env.CST_ID || '',
            custKey : process.env.CUST_KEY || '',
        }


    post(url, JSON.stringify(params), {
            headers: {
                'content-type': 'application/json',
                'referer': process.env.PCD_HTTP_REFERER
            }
        })
        .then(r => res.json( {  ...r.data }))
        .catch(err => console.error(err))
    /**
     * return json
    {
        "result": "success",
        "result_msg": "사용자 인증 완료!!",
        "cst_id": "test",
        "custKey": "abcd1234567890",
        "AuthKey": "fc63fe1ed0016321a666b1a9c0b6f68d9d5e4ff5c57e448314ba3352da59f1a7",
        "return_url": "https://testcpay.payple.kr/index.php?ACT_=PAYM"
    }
    */

})




/*
 * 최종승인 요청 REST
 */
app.post('/payconfirm', (req, res) => {

//    console.log(req.body);
    
   let url = req.body.PCD_PAY_COFURL,
       params = {
            PCD_CST_ID  : process.env.CST_ID,
            PCD_CUST_KEY : process.env.CUST_KEY,
            PCD_AUTH_KEY : req.body.PCD_AUTH_KEY,
            PCD_PAY_TYPE : req.body.PCD_PAY_TYPE,
			PCD_PAYER_ID : req.body.PCD_PAYER_ID,
			PCD_PAY_REQKEY : req.body.PCD_PAY_REQKEY
      }
   
    post(url, JSON.stringify(params), {
            headers: {
                'content-type': 'application/json',
                'referer': process.env.PCD_HTTP_REFERER
            }
        })
        .then(r => res.json( {  ...r.data }))
        .catch(err => console.error(err))
   

})


/*
 * 계좌 간편 단건결제 요청 REST
 */
app.post('/transferSimple', (req, res) => {

    /*########################### AUTH #############################################*/
    /* 
     * process.env.URL
     * DEV  : http://dev.testcpay.payple.kr/php/auth.php
     * TEST : https://testcpay.payple.kr/php/auth.php
     * REAL : https://cpay.payple.kr/php/auth.php 
     */
    
    let url = process.env.URL,
        params = {
            cst_id  : process.env.CST_ID || '',
            custKey : process.env.CUST_KEY || '',
            PCD_PAY_TYPE : 'transfer',
            PCD_SIMPLE_FLAG : 'Y'
        },
        params2 = {
            PCD_CST_ID  : req.body.cst_id,
            PCD_CUST_KEY : req.body.custKey,
            PCD_AUTH_KEY : req.body.AuthKey,
            PCD_PAY_TYPE : 'transfer',
            PCD_PAYER_ID : req.body.PCD_PAYER_ID,
            PCD_PAYER_NO : req.body.PCD_PAYER_NO,
			PCD_PAYER_EMAIL : req.body.PCD_PAYER_EMAIL || '',
			PCD_PAY_OID : req.body.PCD_PAY_OID,
            PCD_PAY_GOODS : req.body.PCD_PAY_GOODS,
            PCD_PAY_TOTAL : req.body.PCD_PAY_TOTAL,
            PCD_PAY_ISTAX : req.body.PCD_PAY_ISTAX || 'Y',
            PCD_PAY_TAXTOTAL : req.body.PCD_PAY_TAXTOTAL || '',
            PCD_TAXSAVE_FLAG : req.body.PCD_TAXSAVE_FLAG || 'N',
            PCD_SIMPLE_FLAG : 'Y',
            PCD_TAXSAVE_TRADE : req.body.PCD_TAXSAVE_TRADE || '',
            PCD_TAXSAVE_IDNUM : req.body.PCD_TAXSAVE_IDNUM || ''
        }
    
    post(url, JSON.stringify(params), {
            headers: {
                'content-type': 'application/json',
                'referer': process.env.PCD_HTTP_REFERER
            }
        })
        .then(r => {
                    
                    /*################################################################################*/
                    console.log(r.data)
                       /**
                         * return json
                        {
                            "result": "success",
                            "result_msg": "사용자 인증 완료!!",
                            "cst_id": "test",
                            "custKey": "abcd1234567890",
                            "AuthKey": "fc63fe1ed0016321a666b1a9c0b6f68d9d5e4ff5c57e448314ba3352da59f1a7",
                            "PCD_PAY_HOST": "https://testcpay.payple.kr",
                            "PCD_PAY_URL": "/php/SimplePayAct.php?ACT_=PAYM"
                            "return_url": "https://testcpay.payple.kr/php/SimplePayAct.php?ACT_=PAYM"
                        }
                        */        
                    /*################################################################################*/
                    
                    
                    /**
                      * 계좌 간편결제 요청 REQ SET
                      */
                    let url2 = r.data.return_url                // 계좌 간편결제 API URL

                    params2['PCD_CST_ID'] = r.data.cst_id,      // return 받은 cst_id token
                    params2['PCD_CUST_KEY'] = r.data.custKey    // return 받은 custKey token
                    params2['PCD_AUTH_KEY'] = r.data.AuthKey    // return 받은 AuthKey token
                            
                    /*################################################################################*/        
                    console.log(params2)
                    /*################################################################################*/        
        
                    post(url2, JSON.stringify(params2), {
                            headers: {
                                'content-type': 'application/json',
                                'referer': process.env.PCD_HTTP_REFERER
                            }
                        })
                        .then(r => res.json( {  ...r.data }))
                        .catch(err => console.error(err))  
        
        })
        .catch(err => console.error(err))

    

})



/*
 * 계좌 간편 정기결제 요청 REST
 */
app.post('/transferReguler', (req, res) => {

    /*########################### AUTH #############################################*/
    /* 
     * process.env.URL
     * DEV  : http://dev.testcpay.payple.kr/php/auth.php
     * TEST : https://testcpay.payple.kr/php/auth.php
     * REAL : https://cpay.payple.kr/php/auth.php 
     */
    
    let url = process.env.URL,
        params = {
            cst_id  : process.env.CST_ID || '',
            custKey : process.env.CUST_KEY || '',
            PCD_PAY_TYPE : 'transfer',
            PCD_SIMPLE_FLAG : 'Y'
        },
        params2 = {
            PCD_CST_ID  : req.body.cst_id,
            PCD_CUST_KEY : req.body.custKey,
            PCD_AUTH_KEY : req.body.AuthKey,
            PCD_PAY_TYPE : 'transfer',
            PCD_PAYER_ID : req.body.PCD_PAYER_ID,
            PCD_PAYER_NO : req.body.PCD_PAYER_NO,
			PCD_PAYER_EMAIL : req.body.PCD_PAYER_EMAIL || '',
			PCD_PAY_OID : req.body.PCD_PAY_OID,
            PCD_PAY_GOODS : req.body.PCD_PAY_GOODS,
            PCD_PAY_TOTAL : req.body.PCD_PAY_TOTAL,
            PCD_PAY_ISTAX : req.body.PCD_PAY_ISTAX || 'Y',
            PCD_PAY_TAXTOTAL : req.body.PCD_PAY_TAXTOTAL || '',
            PCD_TAXSAVE_FLAG : req.body.PCD_TAXSAVE_FLAG || 'N',
            PCD_REGULER_FLAG : 'Y',
            PCD_PAY_YEAR : req.body.PCD_PAY_YEAR,
            PCD_PAY_MONTH : req.body.PCD_PAY_MONTH,
            PCD_TAXSAVE_TRADE : req.body.PCD_TAXSAVE_TRADE || '',
            PCD_TAXSAVE_IDNUM : req.body.PCD_TAXSAVE_IDNUM || ''
        }
    
    post(url, JSON.stringify(params), {
            headers: {
                'content-type': 'application/json',
                'referer': process.env.PCD_HTTP_REFERER
            }
        })
        .then(r => {
                    
                    /*################################################################################*/
                    console.log(r.data)
                       /**
                         * return json
                        {
                            "result": "success",
                            "result_msg": "사용자 인증 완료!!",
                            "cst_id": "test",
                            "custKey": "abcd1234567890",
                            "AuthKey": "fc63fe1ed0016321a666b1a9c0b6f68d9d5e4ff5c57e448314ba3352da59f1a7",
                            "PCD_PAY_HOST": "https://testcpay.payple.kr",
                            "PCD_PAY_URL": "/php/RePayAct.php?ACT_=PAYM"
                            "return_url": "https://testcpay.payple.kr/php/RePayAct.php?ACT_=PAYM"
                        }
                        */        
                    /*################################################################################*/
                    
                    
                    /**
                      * 계좌 간편 정기결제 요청 REQ SET
                      */
                    let url2 = r.data.return_url                // 계좌 간편 정기결제 API URL

                    params2['PCD_CST_ID'] = r.data.cst_id,      // return 받은 cst_id token
                    params2['PCD_CUST_KEY'] = r.data.custKey    // return 받은 custKey token
                    params2['PCD_AUTH_KEY'] = r.data.AuthKey    // return 받은 AuthKey token
                            
                    /*################################################################################*/        
                    console.log(params2)
                    /*################################################################################*/        
        
                    post(url2, JSON.stringify(params2), {
                            headers: {
                                'content-type': 'application/json',
                                'referer': process.env.PCD_HTTP_REFERER
                            }
                        })
                        .then(r => res.json( {  ...r.data }))
                        .catch(err => console.error(err))  
        
        })
        .catch(err => console.error(err))

    

})


/*
 * 카드 간편 단건결제 요청 REST
 */
app.post('/simplePayCard', (req, res) => {

    /*########################### AUTH #############################################*/
    /* 
     * process.env.URL
     * DEV  : http://dev.testcpay.payple.kr/php/auth.php
     * TEST : https://testcpay.payple.kr/php/auth.php
     * REAL : https://cpay.payple.kr/php/auth.php 
     */
    
    let url = process.env.URL,
        params = {
            cst_id  : process.env.CST_ID || '',
            custKey : process.env.CUST_KEY || '',
            PCD_PAY_TYPE : 'card',
            PCD_SIMPLE_FLAG : 'Y'
        },
        params2 = {
            PCD_CST_ID  : req.body.cst_id,
            PCD_CUST_KEY : req.body.custKey,
            PCD_AUTH_KEY : req.body.AuthKey,
            PCD_PAY_TYPE : 'card',
            PCD_PAYER_ID : req.body.PCD_PAYER_ID,
            PCD_PAYER_NO : req.body.PCD_PAYER_NO,
			PCD_PAYER_EMAIL : req.body.PCD_PAYER_EMAIL || '',
			PCD_PAY_OID : req.body.PCD_PAY_OID,
            PCD_PAY_GOODS : req.body.PCD_PAY_GOODS,
            PCD_PAY_TOTAL : req.body.PCD_PAY_TOTAL,
            PCD_PAY_ISTAX : req.body.PCD_PAY_ISTAX || 'Y',
            PCD_PAY_TAXTOTAL : req.body.PCD_PAY_TAXTOTAL || '',
            PCD_SIMPLE_FLAG : 'Y'
        }
    
    post(url, JSON.stringify(params), {
            headers: {
                'content-type': 'application/json',
                'referer': process.env.PCD_HTTP_REFERER
            }
        })
        .then(r => {
                    
                    /*################################################################################*/
                    console.log(r.data)
                       /**
                         * return json
                        {
                            "result": "success",
                            "result_msg": "사용자 인증 완료!!",
                            "cst_id": "test",
                            "custKey": "abcd1234567890",
                            "AuthKey": "fc63fe1ed0016321a666b1a9c0b6f68d9d5e4ff5c57e448314ba3352da59f1a7",
                            "PCD_PAY_HOST": "https://testcpay.payple.kr",
                            "PCD_PAY_URL": "/php/SimplePayCardAct.php?ACT_=PAYM"
                            "return_url": "https://testcpay.payple.kr/php/SimplePayCardAct.php?ACT_=PAYM"
                        }
                        */        
                    /*################################################################################*/
                    
                    
                    /**
                      * 카드 간편결제 요청 REQ SET
                      */
                    let url2 = r.data.return_url                // 카드 간편결제 API URL

                    params2['PCD_CST_ID'] = r.data.cst_id,      // return 받은 cst_id token
                    params2['PCD_CUST_KEY'] = r.data.custKey    // return 받은 custKey token
                    params2['PCD_AUTH_KEY'] = r.data.AuthKey    // return 받은 AuthKey token
                            
                    /*################################################################################*/        
                    console.log(params2)
                    /*################################################################################*/        
        
                    post(url2, JSON.stringify(params2), {
                            headers: {
                                'content-type': 'application/json',
                                'referer': process.env.PCD_HTTP_REFERER
                            }
                        })
                        .then(r => res.json( {  ...r.data }))
                        .catch(err => console.error(err))  
        
        })
        .catch(err => console.error(err))

    

})


/*
 * 카드 간편 정기결제 요청 REST
 */
app.post('/regulerPayCard', (req, res) => {

    /*########################### AUTH #############################################*/
    /* 
     * process.env.URL
     * DEV  : http://dev.testcpay.payple.kr/php/auth.php
     * TEST : https://testcpay.payple.kr/php/auth.php
     * REAL : https://cpay.payple.kr/php/auth.php 
     */
    
    let url = process.env.URL,
        params = {
            cst_id  : process.env.CST_ID || '',
            custKey : process.env.CUST_KEY || '',
            PCD_PAY_TYPE : 'card',
            PCD_SIMPLE_FLAG : 'Y'
        },
        params2 = {
            PCD_CST_ID  : req.body.cst_id,
            PCD_CUST_KEY : req.body.custKey,
            PCD_AUTH_KEY : req.body.AuthKey,
            PCD_PAY_TYPE : 'card',
            PCD_PAYER_ID : req.body.PCD_PAYER_ID,
            PCD_PAYER_NO : req.body.PCD_PAYER_NO,
			PCD_PAYER_EMAIL : req.body.PCD_PAYER_EMAIL || '',
			PCD_PAY_OID : req.body.PCD_PAY_OID,
            PCD_PAY_GOODS : req.body.PCD_PAY_GOODS,
            PCD_PAY_TOTAL : req.body.PCD_PAY_TOTAL,
            PCD_PAY_ISTAX : req.body.PCD_PAY_ISTAX || 'Y',
            PCD_PAY_TAXTOTAL : req.body.PCD_PAY_TAXTOTAL || '',
            PCD_REGULER_FLAG : 'Y',
            PCD_PAY_YEAR : req.body.PCD_PAY_YEAR,
            PCD_PAY_MONTH : req.body.PCD_PAY_MONTH
        }
    
    post(url, JSON.stringify(params), {
            headers: {
                'content-type': 'application/json',
                'referer': process.env.PCD_HTTP_REFERER
            }
        })
        .then(r => {
                    
                    /*################################################################################*/
                    console.log(r.data)
                       /**
                         * return json
                        {
                            "result": "success",
                            "result_msg": "사용자 인증 완료!!",
                            "cst_id": "test",
                            "custKey": "abcd1234567890",
                            "AuthKey": "fc63fe1ed0016321a666b1a9c0b6f68d9d5e4ff5c57e448314ba3352da59f1a7",
                            "PCD_PAY_HOST": "https://testcpay.payple.kr",
                            "PCD_PAY_URL": "/php/RePayCardAct.php?ACT_=PAYM"
                            "return_url": "https://testcpay.payple.kr/php/RePayCardAct.php?ACT_=PAYM"
                        }
                        */        
                    /*################################################################################*/
                    
                    
                    /**
                      * 카드 간편결제 요청 REQ SET
                      */
                    let url2 = r.data.return_url                // 카드 간편결제 API URL

                    params2['PCD_CST_ID'] = r.data.cst_id,      // return 받은 cst_id token
                    params2['PCD_CUST_KEY'] = r.data.custKey    // return 받은 custKey token
                    params2['PCD_AUTH_KEY'] = r.data.AuthKey    // return 받은 AuthKey token
                            
                    /*################################################################################*/        
                    console.log(params2)
                    /*################################################################################*/        
        
                    post(url2, JSON.stringify(params2), {
                            headers: {
                                'content-type': 'application/json',
                                'referer': process.env.PCD_HTTP_REFERER
                            }
                        })
                        .then(r => res.json( {  ...r.data }))
                        .catch(err => console.error(err))  
        
        })
        .catch(err => console.error(err))
})



/*
 * 결제결과 조회 요청 REST
 */
app.post('/paycheck', (req, res) => {

    /*########################### AUTH #############################################*/
    /* 
     * process.env.URL
     * DEV  : http://dev.testcpay.payple.kr/php/auth.php
     * TEST : https://testcpay.payple.kr/php/auth.php
     * REAL : https://cpay.payple.kr/php/auth.php 
     */
    
    let url = process.env.URL,
        params = {
            cst_id  : process.env.CST_ID || '',
            custKey : process.env.CUST_KEY || '',
            PCD_PAYCHECK_FLAG : 'Y'
        },
        params2 = {
            PCD_CST_ID  : req.body.cst_id,
            PCD_CUST_KEY : req.body.custKey,
            PCD_AUTH_KEY : req.body.AuthKey,
            PCD_PAYCHK_FLAG : 'Y',
            PCD_PAY_TYPE : req.body.PCD_PAY_TYPE,
            PCD_PAY_OID : req.body.PCD_PAY_OID,
            PCD_REGULER_FLAG : req.body.PCD_REGULER_FLAG,
            PCD_PAY_YEAR : req.body.PCD_PAY_YEAR,
            PCD_PAY_MONTH : req.body.PCD_PAY_MONTH,
            PCD_PAY_DATE : req.body.PCD_PAY_DATE
        }
    
    post(url, JSON.stringify(params), {
            headers: {
                'content-type': 'application/json',
                'referer': process.env.PCD_HTTP_REFERER
            }
        })
        .then(r => {
                    
                    /*################################################################################*/
                    console.log(r.data)
                       /**
                         * return json
                        {
                            "result": "success",
                            "result_msg": "사용자 인증 완료!!",
                            "cst_id": "test",
                            "custKey": "abcd1234567890",
                            "AuthKey": "fc63fe1ed0016321a666b1a9c0b6f68d9d5e4ff5c57e448314ba3352da59f1a7",
                            "PCD_PAY_HOST": "https://testcpay.payple.kr",
                            "PCD_PAY_URL": "/php/PayChkAct.php"
                            "return_url": "https://testcpay.payple.kr/php/PayChkAct.php"
                        }
                        */        
                    /*################################################################################*/
                    
                    
                    /**
                      * 결제결과 조회 요청 REQ SET
                      */
                    let url2 = r.data.return_url                // 결제결과 조회 요청 API URL

                    params2['PCD_CST_ID'] = r.data.cst_id,      // return 받은 cst_id token
                    params2['PCD_CUST_KEY'] = r.data.custKey    // return 받은 custKey token
                    params2['PCD_AUTH_KEY'] = r.data.AuthKey    // return 받은 AuthKey token
                            
                    /*################################################################################*/        
                    console.log(params2)
                    /*################################################################################*/        
        
                    post(url2, JSON.stringify(params2), {
                            headers: {
                                'content-type': 'application/json',
                                'referer': process.env.PCD_HTTP_REFERER
                            }
                        })
                        .then(r => res.json( {  ...r.data }))
                        .catch(err => console.error(err))  
        
        })
        .catch(err => console.error(err))

    

})


/*
 * 현금영수증 발행 요청 REST
 */
app.post('/taxsaveReg', (req, res) => {

    /*########################### AUTH #############################################*/
    /* 
     * process.env.URL
     * DEV  : http://dev.testcpay.payple.kr/php/auth.php
     * TEST : https://testcpay.payple.kr/php/auth.php
     * REAL : https://cpay.payple.kr/php/auth.php 
     */
    
    let url = process.env.URL,
        params = {
            cst_id  : process.env.CST_ID || '',
            custKey : process.env.CUST_KEY || '',
            PCD_PAY_WORK : 'TSREG'
        },
        params2 = {
            PCD_CST_ID  : req.body.cst_id,
            PCD_CUST_KEY : req.body.custKey,
            PCD_AUTH_KEY : req.body.AuthKey,
            PCD_TAXSAVE_AMOUNT : req.body.PCD_TAXSAVE_AMOUNT,
            PCD_TAXSAVE_TAXTOTAL : req.body.PCD_TAXSAVE_TAXTOTAL,
			PCD_PAY_OID : req.body.PCD_PAY_OID,
            PCD_REGULER_FLAG : req.body.PCD_REGULER_FLAG,
            PCD_TAXSAVE_TRADEUSE : req.body.PCD_TAXSAVE_TRADEUSE,
            PCD_TAXSAVE_IDENTINUM : req.body.PCD_TAXSAVE_IDENTINUM,
            PCD_TAXSAVE_EMAIL : req.body.PCD_TAXSAVE_EMAIL || ''
        }
    
    post(url, JSON.stringify(params), {
            headers: {
                'content-type': 'application/json',
                'referer': process.env.PCD_HTTP_REFERER
            }
        })
        .then(r => {
                    
                    /*################################################################################*/
                    console.log(r.data)
                       /**
                         * return json
                        {
                            "result": "success",
                            "result_msg": "사용자 인증 완료!!",
                            "cst_id": "test",
                            "custKey": "abcd1234567890",
                            "AuthKey": "fc63fe1ed0016321a666b1a9c0b6f68d9d5e4ff5c57e448314ba3352da59f1a7",
                            "PCD_PAY_HOST": "https://testcpay.payple.kr",
                            "PCD_PAY_URL": "/php/taxsave/api/tsAct.php?ACT_=TSREG"
                            "return_url": "https://testcpay.payple.kr/php/taxsave/api/tsAct.php?ACT_=TSREG"
                        }
                        */        
                    /*################################################################################*/
                    
                    
                    /**
                      * 현금영수증 요청 REQ SET
                      */
                    let url2 = r.data.return_url                // 현금영수증 발행 요청 API URL

                    params2['PCD_CST_ID'] = r.data.cst_id,      // return 받은 cst_id token
                    params2['PCD_CUST_KEY'] = r.data.custKey    // return 받은 custKey token
                    params2['PCD_AUTH_KEY'] = r.data.AuthKey    // return 받은 AuthKey token
                            
                    /*################################################################################*/        
                    console.log(params2)
                    /*################################################################################*/        
        
                    post(url2, JSON.stringify(params2), {
                            headers: {
                                'content-type': 'application/json',
                                'referer': process.env.PCD_HTTP_REFERER
                            }
                        })
                        .then(r => res.json( {  ...r.data }))
                        .catch(err => console.error(err))  
        
        })
        .catch(err => console.error(err))

    

})


/*
 * 현금영수증 발행취소 요청 REST
 */
app.post('/taxsaveReg', (req, res) => {

    /*########################### AUTH #############################################*/
    /* 
     * process.env.URL
     * DEV  : http://dev.testcpay.payple.kr/php/auth.php
     * TEST : https://testcpay.payple.kr/php/auth.php
     * REAL : https://cpay.payple.kr/php/auth.php 
     */
    
    let url = process.env.URL,
        params = {
            cst_id  : process.env.CST_ID || '',
            custKey : process.env.CUST_KEY || '',
            PCD_PAY_WORK : 'TSCANCEL'
        },
        params2 = {
            PCD_CST_ID  : req.body.cst_id,
            PCD_CUST_KEY : req.body.custKey,
            PCD_AUTH_KEY : req.body.AuthKey,
			PCD_PAY_OID : req.body.PCD_PAY_OID,
            PCD_REGULER_FLAG : req.body.PCD_REGULER_FLAG || 'N',
            PCD_TAXSAVE_EMAIL : req.body.PCD_TAXSAVE_EMAIL || ''
        }
    
    post(url, JSON.stringify(params), {
            headers: {
                'content-type': 'application/json',
                'referer': process.env.PCD_HTTP_REFERER
            }
        })
        .then(r => {
                    
                    /*################################################################################*/
                    console.log(r.data)
                       /**
                         * return json
                        {
                            "result": "success",
                            "result_msg": "사용자 인증 완료!!",
                            "cst_id": "test",
                            "custKey": "abcd1234567890",
                            "AuthKey": "fc63fe1ed0016321a666b1a9c0b6f68d9d5e4ff5c57e448314ba3352da59f1a7",
                            "PCD_PAY_HOST": "https://testcpay.payple.kr",
                            "PCD_PAY_URL": "/php/taxsave/api/tsAct.php?ACT_=TSCANCEL"
                            "return_url": "https://testcpay.payple.kr/php/taxsave/api/tsAct.php?ACT_=TSCANCEL"
                        }
                        */        
                    /*################################################################################*/
                    
                    
                    /**
                      * 현금영수증 발행취소 요청 REQ SET
                      */
                    let url2 = r.data.return_url                // 현금영수증 발행취소 요청 API URL

                    params2['PCD_CST_ID'] = r.data.cst_id,      // return 받은 cst_id token
                    params2['PCD_CUST_KEY'] = r.data.custKey    // return 받은 custKey token
                    params2['PCD_AUTH_KEY'] = r.data.AuthKey    // return 받은 AuthKey token
                            
                    /*################################################################################*/        
                    console.log(params2)
                    /*################################################################################*/        
        
                    post(url2, JSON.stringify(params2), {
                            headers: {
                                'content-type': 'application/json',
                                'referer': process.env.PCD_HTTP_REFERER
                            }
                        })
                        .then(r => res.json( {  ...r.data }))
                        .catch(err => console.error(err))  
        
        })
        .catch(err => console.error(err))

    

})



/*
* 가맹점인증 요청 REST
*/
app.get('/puserDel2', (req, res) => {
    
    let data = {},
    opts = {}
    
    ejs.renderFile(__dirname + '/ejs/auth.html', data, opts, (err, str) => !err && res.send(str))
})

app.post('/puserDel3', (req, res) => {

    /* 
    * process.env.URL
    * TEST : https://testcpay.payple.kr/php/auth.php
    * REAL : https://cpay.payple.kr/php/auth.php 
    */
    let url = process.env.URL,
        params = {
            cst_id  : process.env.CST_ID || '',
            custKey : process.env.CUST_KEY || '',
            PCD_PAY_WORK : process.env.PCD_PAY_WORK || ''
        }


    post(url, JSON.stringify(params), {
            headers: {
                'content-type': 'application/json'
            }
        })
        .then(r => res.json( {  ...r.data }))
        .catch(err => console.error(err))
})



/*
 * 계좌/카드 등록해지 요청 REST
 */
app.post('/puserDel', (req, res) => {

    /*########################### AUTH #############################################*/
    /* 
     * process.env.URL
     * DEV  : http://dev.testcpay.payple.kr/php/auth.php
     * TEST : https://testcpay.payple.kr/php/auth.php
     * REAL : https://cpay.payple.kr/php/auth.php 
     */
    
    let url = process.env.URL,
        params = {
            cst_id  : process.env.CST_ID || '',
            custKey : process.env.CUST_KEY || '',
            PCD_PAY_WORK : 'PUSERDEL'
        },
        params2 = {
            PCD_CST_ID  : req.body.cst_id,
            PCD_CUST_KEY : req.body.custKey,
            PCD_AUTH_KEY : req.body.AuthKey,
            PCD_PAYER_ID : req.body.PCD_PAYER_ID,
            PCD_PAYER_NO : req.body.PCD_PAYER_NO || ''
        }
    
    post(url, JSON.stringify(params), {
            headers: {
                'content-type': 'application/json',
                'referer': process.env.PCD_HTTP_REFERER
            }
        })
        .then(r => {
                    
                    /*################################################################################*/
                    console.log(r.data)
                       /**
                         * return json
                        {
                            "result": "success",
                            "result_msg": "사용자 인증 완료!!",
                            "cst_id": "test",
                            "custKey": "abcd1234567890",
                            "AuthKey": "fc63fe1ed0016321a666b1a9c0b6f68d9d5e4ff5c57e448314ba3352da59f1a7",
                            "PCD_PAY_HOST": "https://testcpay.payple.kr",
                            "PCD_PAY_URL": "/php/cPayUser/api/cPayUserAct.php?ACT_=PUSERDEL"
                            "return_url": "https://testcpay.payple.kr/php/cPayUser/api/cPayUserAct.php?ACT_=PUSERDEL"
                        }
                        */        
                    /*################################################################################*/
                    
                    
                    /**
                      * 계좌/카드 요청 REQ SET
                      */
                    let url2 = r.data.return_url                // 계좌/카드 등록해지 요청 API URL

                    params2['PCD_CST_ID'] = r.data.cst_id,      // return 받은 cst_id token
                    params2['PCD_CUST_KEY'] = r.data.custKey    // return 받은 custKey token
                    params2['PCD_AUTH_KEY'] = r.data.AuthKey    // return 받은 AuthKey token
                            
                    /*################################################################################*/        
                    console.log(params2)
                    /*################################################################################*/        
        
                    post(url2, JSON.stringify(params2), {
                            headers: {
                                'content-type': 'application/json',
                                'referer': process.env.PCD_HTTP_REFERER
                            }
                        })
                        .then(r => res.json( {  ...r.data }))
                        .catch(err => console.error(err))  
        
        })
        .catch(err => console.error(err))

    

})




/*
 * 환불(승인취소) 요청 REST
 */
app.post('/refund', (req, res) => {

    /*########################### AUTH #############################################*/
    /* 
     * process.env.URL
     * DEV  : http://dev.testcpay.payple.kr/php/auth.php
     * TEST : https://testcpay.payple.kr/php/auth.php
     * REAL : https://cpay.payple.kr/php/auth.php 
     */
    
    let url = process.env.URL,
        params = {
            cst_id  : process.env.CST_ID || '',
            custKey : process.env.CUST_KEY || '',
            PCD_PAYCANCEL_FLAG : 'Y'
        },
        params2 = {
            PCD_CST_ID  : req.body.cst_id,
            PCD_CUST_KEY : req.body.custKey,
            PCD_AUTH_KEY : req.body.AuthKey,
			PCD_PAYER_EMAIL : req.body.PCD_PAYER_EMAIL || '',
			PCD_PAY_OID : req.body.PCD_PAY_OID,
			PCD_PAY_DATE : req.body.PCD_PAY_DATE,
			PCD_REGULER_FLAG : req.body.PCD_REGULER_FLAG,
			PCD_PAY_YEAR : req.body.PCD_PAY_YEAR,
			PCD_PAY_MONTH : req.body.PCD_PAY_MONTH,
			PCD_REFUND_TOTAL : req.body.PCD_REFUND_TOTAL,
			PCD_REFUND_TAXTOTAL : req.body.PCD_REFUND_TAXTOTAL,
			PCD_PAYCANCEL_FLAG : 'Y',
			PCD_REFUND_KEY : process.env.PCD_REFUND_KEY
        }
    
    post(url, JSON.stringify(params), {
            headers: {
                'content-type': 'application/json',
                'referer': process.env.PCD_HTTP_REFERER
            }
        })
        .then(r => {
                    
                    /*################################################################################*/
                    console.log(r.data)
                       /**
                         * return json
                        {
                            "result": "success",
                            "result_msg": "사용자 인증 완료!!",
                            "cst_id": "test",
                            "custKey": "abcd1234567890",
                            "AuthKey": "fc63fe1ed0016321a666b1a9c0b6f68d9d5e4ff5c57e448314ba3352da59f1a7",
                            "PCD_PAY_HOST": "https://testcpay.payple.kr",
                            "PCD_PAY_URL": "/php/account/api/cPayCAct.php"
                            "return_url": "https://testcpay.payple.kr/php/account/api/cPayCAct.php"
                        }
                        */        
                    /*################################################################################*/
                    
                    
                    /**
                      * 환불(승인취소) 요청 REQ SET
                      */
                    let url2 = r.data.return_url                // 환불(승인요청) API URL

                    params2['PCD_CST_ID'] = r.data.cst_id,      // return 받은 cst_id token
                    params2['PCD_CUST_KEY'] = r.data.custKey    // return 받은 custKey token
                    params2['PCD_AUTH_KEY'] = r.data.AuthKey    // return 받은 AuthKey token
                            
                    /*################################################################################*/        
                    console.log(params2)
                    /*################################################################################*/        
        
                    post(url2, JSON.stringify(params2), {
                            headers: {
                                'content-type': 'application/json',
                                'referer': process.env.PCD_HTTP_REFERER
                            }
                        })
                        .then(r => res.json( {  ...r.data }))
                        .catch(err => console.error(err))  
        
        })
        .catch(err => console.error(err))

    

})







module.exports = app
