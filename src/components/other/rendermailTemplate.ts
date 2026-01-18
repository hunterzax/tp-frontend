// const templateMail = async ({ header, description, btntxt, url, pwd, mode = "resetmail" } : any) => {
const templateMail = async ({ header, description, btntxt, url, pwd, mode }: any) => {
    //background: linear-gradient(90deg, #0BACF2 0%, #4BB285 100%); สีปุ่มเดิม
    const getBody: any = () => {
        if (mode == "resetmail") {
            const body: any = `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                </head>
                <body>
                    <div 
                        style="width: 500px; 
                        border: 1px solid #D6D6D6; 
                        height: auto; 
                        border-radius: 15px;
                        margin: 10px auto;
                        padding: 15px;"
                    >
                        <div
                            style="display: flex;
                            margin-bottom: 50px;"
                        >
                            <img
                                src="https://nu-test01.nueamek.app/exynos/20241203082755_logo-ptt.png"
                                alt="logo-ptt"
                                style="margin: 0 auto; width: 120px; object-fit: contain;"
                            />
                        </div>
                        <div
                            style="display: flex;
                            margin-bottom: 40px;"
                        >
                            <img
                                src="https://nu-test01.nueamek.app/exynos/20241203082741_email-img.png"
                                alt="img-email"
                                style="margin: 0 auto; object-fit: contain;"
                            />
                        </div>
                        <div
                            style="text-align: center;
                            font-size: 20px;
                            font-weight: 700;"
                        >
                            ${header}
                        </div>
                        <div
                            style="line-height: 40px;
                            margin-top: 20px;
                            text-align: center;
                            font-size: 15px;
                            "
                        >
                            ${description}
                        </div>
                        <div
                            style="margin-top: 20px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            "
                        >
                            <a 
                                href="${url}"
                                style="font-size: 18px; 
                                    font-weight: 700; 
                                    color: #fff; 
                                    background: #0BACF2;
                                    padding: 15px 50px;
                                    border-radius: 10px;
                                    border: none;
                                    margin: 0 auto;
                                "
                            >
                                 ${btntxt}
                            </a>
                        </div>
                        <div style="margin-top: 30px; font-size: 15px;">
                            <div style="text-align: center;">
                                Thank You,
                            </div>
                            <div style="text-align: center;">
                                TPA, Systems
                            </div>
                        </div>
                        <div style="margin-top: 40px; text-align: center; font-size: 14px;">
                            <span>If you did not initiate this request, please contact us immediately at </span>
                            <a href="#">support@ptt.com.</a>
                        </div>
                    </div>
                </body>
            </html>`
            return body
        } else if (mode == "createuser") {
            const body: any = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                <div 
                    style="width: 500px; 
                    border: 1px solid #D6D6D6; 
                    height: auto; 
                    border-radius: 15px;
                    margin: 10px auto;
                    padding: 40px 0px
                    "
                >
                    <div
                        style="display: flex;
                        margin-bottom: 50px;"
                    >
                        <img
                            src="https://nu-test01.nueamek.app/exynos/20241203082755_logo-ptt.png"
                            alt="logo-ptt"
                            style="margin: 0 auto; width: 120px; object-fit: contain;"
                        />
                    </div>
                    <div
                        style="display: flex;
                        margin-bottom: 40px;"
                    >
                        <img
                            src="https://nu-test01.nueamek.app/exynos/20241203082741_email-img.png"
                            alt="img-email"
                            style="margin: 0 auto; object-fit: contain;"
                        />
                    </div>
                    <div
                        style="text-align: center;
                        font-size: 20px;
                        font-weight: 700;"
                    >
                        Activate Account
                    </div>
                    <div
                        style="text-align: center;
                        font-size: 26px;
                        font-weight: 700;
                        display: flex;
                        margin-top: 20px;"
                    >
                        <div style="border: 1px solid #0BACF2; margin: 0 auto; padding: 10px 40px; border-radius: 10px; color: #0BACF2;">
                            ${pwd}
                        </div>
                    </div>
                    <div
                        style="text-align: center;
                        font-size: 16px;
                        font-weight: 700;
                        margin-top: 20px;
                        color: #ED1B24;"
                    >
                    this code will expire within 30 minutes
                    </div>
                    <div
                        style="line-height: 30px;
                        margin-top: 20px;
                        text-align: center;
                        "
                    >
                        Your account has been successfully created. <br/>
                        Please click the button below to activate your account.
                    </div>
                    <div
                        style="margin-top: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        "
                    >
                        <a 
                            href="${url}"
                            style="font-size: 18px; 
                                font-weight: 700; 
                                color: #fff; 
                                background: #0BACF2;
                                padding: 15px 50px;
                                border-radius: 10px;
                                border: none;
                                margin: 0 auto;
                            "
                        >
                            Activate Account
                        </a>
                    </div>
                    <div style="margin-top: 6rem; text-align: center;">
                        <span>If you did not initiate this request, please contact us immediately at </span>
                        <a href="#">support@ptt.com.</a>
                    </div>
                </div>
            </body>
            </html>`
            return body
        }
    }

    const templateBody: any = async () => {
        let bodyitem: any = getBody();
        return await renderJson(bodyitem)
    }

    const renderJson: any = (item: any) => {
        return JSON.stringify(item.replace(/\s+/g, ' ').trim());
    }

    return await templateBody();
};

export default templateMail;