let URL = "https://script.google.com/macros/s/AKfycbxB_2RlmJVE1mQBqs70nsyJ077bDdgOzYdXun0vgUnXzbWmXq1TNUK2tbgaVjVIYy9H/exec";
//生徒登校時
function comeSt(name) {
    let student = JSON.parse(localStorage.getItem(name));
    let now = createTime(1);
    //初回登校時
    if(student.aTime == null) {
        //setStrage(name,data.pTime,now,null,data.bTime,data.info1,data.info2);
        setStorage(name, student.pTime, now, null, student.bTime, student.info1, student.info2, student.target, student.promise);
    }
    //2回目以降登校時
    else if((student.aTime != null) && (student.bTime != null)){
        setStorage(name, student.pTime, now, null, null, student.info1, student.info2, student.target, student.promise);
    }
    //下校時
    else {
        //setStrage(name,data.pTime,data.aTime,calcTime(data.aTime, now),now,data.info1,data.info2);
        setStorage(name, student.pTime, student.aTime, calcTime(student.aTime, now), now, student.info1, student.info2, student.target, student.promise);
    }
    sleep(300);
    let info = student.info1 + "\n" + student.info2;
    pushDialog(name, now, info); //ダイアログ通知
    attenderSt(name, now, info); //登校者情報
    changeTable(student.name)            //テーブル更新
}

//ロード実行
function loading() {
    let today = createTime(0);
    let date = localStorage.getItem("日付");
    //本日始めてのロードの場合
    if(today != date) {
        localStorage.clear(); //古いローカルストレージを削除
        setDate(today);       //日付をセットする
        getStData();
        sleep(3000);
        loading();
    }
    attenderSts();            //過去の登校者情報をを表示
    createTable();            //テーブルをlocalstorage情報より作成
    setNote();
}

//通知表示
function pushDialog(name, time, info) {
    Push.create("【" + name + "】 " + time, {
        body: info,
        timeout: 10000,
        onclick: function() {
            window.focus();
            this.close();
        }
    });
}

//日付もしくは時間を生成
function createTime(num) {
    let today = new Date();
    //日付を返す
    if(num == 0) {
        let month = today.getMonth() + 1;
        let date = today.getDate();
        return month + "/" + date;
    }
    //時間を返す
    else {
        let hour = today.getHours();
        let minutes = today.getMinutes();
        let seconds = today.getSeconds();
        return hour + ":" + minutes + ":" + seconds;
    }
}

//時間計算
function calcTime(time1, time2) {
    time1 = time1.split(":");
    time2 = time2.split(":");
    time1 = Number(time1[0]) * 3600 + Number(time1[1]) * 60 + Number(time1[2]);
    time2 = Number(time2[0]) * 3600 + Number(time2[1]) * 60 + Number(time2[2]);
    let stay = time2 - time1;
    let minute = Math.floor(stay / 60);
    let hour = Math.floor(stay / 3600);
    stay = stay - minute * 60 - hour * 3600;
    return hour + ":" + minute + ":" + stay;
}

//日付をセットする
function setDate(date) {
    let title = document.getElementById("title");
    title.innerHTML = "&emsp;KITAKA" + date; //htmlに記述
    localStorage.setItem("日付",date);        //localstorageに記述
}

//登校時情報設置
function attenderSt(name, time, info) {
    //追加先
    let right_content = document.querySelector(".right_content");

    //追加生徒
    let student = document.createElement("div");
    student.classList.add("student");

    //ヘッド情報
    let head = document.createElement("div");
    head.classList.add("head");

    //pタグ
    //生徒名
    let stName = document.createElement("p");
    stName.id = "name";
    stName.innerText = "【" + name + "】";
    //登校時間
    let stTime = document.createElement("p");
    stTime.id = "time";
    stTime.innerText = time;
    //生徒情報
    let stInfo = document.createElement("p");
    stInfo.classList.add("info");
    stInfo.innerText = info;

    //タグを追加していく
    head.appendChild(stName);
    head.appendChild(stTime);
    student.appendChild(head);
    student.appendChild(stInfo);
    right_content.prepend(student);
}

//過去の登校者情報
function attenderSts() {
    for(let i = 0; i < localStorage.length; i++) {
        //let key = localStorage.key(i);
        try{
            let key = localStorage.key(i)
            if(key == "日付") {
                continue;
            }
            let data = JSON.parse(localStorage.getItem(key));
            //登校時間がある場合
            if(data.aTime != null) {
                attenderSt(key, data.aTime, data.info1 + "\n" + data.info2);
            }
            else if(data.bTime != null) {
                attenderSt(key, data.bTime, data.info1 + "\n" + data.info2);
            }
        }
        catch(e) {
            console.log(e);
        }
    }
}

//テーブル作成
function createTable() {
    //テーブル情報
    let schedule = document.getElementById("schedule_table");
    let tbody = schedule.tBodies;
    for(let i = 0; i < localStorage.length; i++) {
        //行
        let tr = document.createElement("tr");
        let key = localStorage.key(i)
        if(key == "日付"){
            continue;
        }
        let data;
        try{
            data = JSON.parse(localStorage.getItem(key));
            for(let j = 0; j < 5; j++) {
                //列
                let td = document.createElement("td");
                switch(j) {
                    case 0:
                        td.innerHTML = key;  //名前
                        break;
                    case 1:
                        td.innerHTML = data.pTime; //予定時間
                        break;
                    case 2:
                        td.innerHTML = data.aTime; //登校時間
                        break;
                    case 3:
                        td.innerHTML = data.sTime; //在校時間
                        break;
                    case 4:
                        td.innerHTML = data.bTime; //帰宅時間
                        break;
                    default:
                        break;
                }
                tr.appendChild(td);
            }
            tbody[0].appendChild(tr);
        }
        catch(e) {
            console.log(e);
        }
    }
}

//テーブル情報を更新
function changeTable(name) {
    //生徒の情報
    let data = JSON.parse(localStorage.getItem(name));
    //テーブル情報
    let schedule = document.getElementById("schedule_table");
    for(let i = 0; i < schedule.rows.length; i++) {
        let stName = schedule.rows[i].cells[0].innerHTML;
        if(name == stName) {
            for(let j = 0; j < schedule.rows[i].cells.length; j++) {
                if(stName == name) {
                    switch(j) {
                        case 0:
                            schedule.rows[i].cells[j].innerHTML = name;  //名前
                            break;
                        case 1:
                            schedule.rows[i].cells[j].innerHTML = data.pTime; //予定時間
                            break;
                        case 2:
                            schedule.rows[i].cells[j].innerHTML = data.aTime; //登校時間
                            break;
                        case 3:
                            schedule.rows[i].cells[j].innerHTML = data.sTime; //在校時間
                            break;
                        case 4:
                            schedule.rows[i].cells[j].innerHTML = data.bTime; //帰宅時間
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }
}

//ストレージに追加
function setStorage(name, pTime, aTime, sTime, bTime, info1, info2, target, promise) {
    //key：生徒名
    //value：予定時間、登校時間、在校時間、帰宅時間、生徒情報
    let key = name;
    let value = {pTime : pTime, aTime : aTime, sTime : sTime, bTime : bTime, info1 : info1, info2 : info2, target : target, promise : promise};
    localStorage.setItem(key, JSON.stringify(value));
}

//生徒情報を設置する
function getStData() {
    fetch(URL)
    .then(response => {
        return response.json();
    })
    .then(data => {
        let studentList = data.studentList;
        studentList.forEach(function(student) {
            if(student.name != null)
                setStorage(student.name, student.pTime, null, null, null, student.info1, student.info2, student.target, student.promise);
        })
    })
}

//登校を確認する
function getSpreadSheet() {
    fetch(URL)
    .then(response => {
        return response.json();
    })
    .then(data => {
        let nameList = data.nameList;
        for(let name of nameList) {
            for(let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if(key == "日付") {
                    continue;
                }
                if(name == key) {
                    comeStudent(name);
                }
            }
        }
    })
    .catch(error => {
        console.log(error);
    });
}

//スリープ
function sleep(waitMsec) {
    let  startMsec = new Date();
    while (new Date() - startMsec < waitMsec);
}

//5秒ごとに実行
 setInterval(function(){
     checkSt();
 },5000);

function dd() {
    localStorage.clear();
}

function setNote() {
    //テーブル情報
    let schedule = document.getElementById("note_table");
    let tbody = schedule.tBodies;
    for(let i = 0; i < localStorage.length; i++) {
        //行
        let tr = document.createElement("tr");
        let key = localStorage.key(i)
        if(key == "日付") {
            continue;
        }
        let data;
        try{
            data = JSON.parse(localStorage.getItem(key));
            for(let j = 0; j < 2; j++) {
                //列
                let td = document.createElement("td");
                switch(j) {
                    case 0:
                        td.innerHTML = key;
                        break;
                    case 1:
                        let target = data.target;
                        let promise = data.promise;
                        let moji = "";
                        if((target != "") && (promise != "")) {
                            moji = target + "/\n" + promise;
                        }
                        else if(target != "") {
                            moji = target;
                        }
                        else if(promise != "") {
                            moji = promise;
                        }
                        td.innerHTML = moji; 
                        break;
                    default:
                        break;
                }
                tr.appendChild(td);
            }
            tbody[0].appendChild(tr);
        }
        catch(e) {
            console.log(e);
        }
    }
}

function demo() {
    comeSt("生徒1A")
}

function checkSt() {
    fetch(URL)
    .then(response => {
        return response.json();
    })
    .then(data => {
        let studentList = data.studentList;
        loop: 
        for(let student of studentList) {
            if(student.aTime != "") {
                for(let i = 0; i < localStorage.length; i++) {
                    let key = localStorage.key(i);
                    if(key == "日付") {
                        continue;
                    }
                    let st = JSON.parse(localStorage.getItem(key));
                    if(key == student.name) {
                        if(st.aTime == null) {
                            comeSt(key);
                            break loop;
                        }
                    }
                }
            }
        }
    })
    .catch(error => {
        console.log(error);
    });
}
