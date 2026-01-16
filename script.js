// --- フェーズ1: 初期データの読み込みと準備 ---
let savedData = localStorage.getItem('myMeals');
let meals = savedData ? JSON.parse(savedData) : [];
let editId = null; // フェーズ10: 編集モードの状態を管理する変数

// --- フェーズ2: HTML要素（DOM）の取得 ---
const addBtn = document.getElementById('add-btn');
const mealDate = document.getElementById('meal-date');
const mealMenu = document.getElementById('meal-menu');
const mealTime = document.getElementById('meal-time');
const mealMemo = document.getElementById('meal-memo');
const mealList = document.getElementById('meal-list');
const filterDate = document.getElementById('filter-date');
const showAllBtn = document.getElementById('show-all-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const totalCountDisplay = document.getElementById('total-count');

// --- フェーズ3: 起動時の初期設定 ---
const today = new Date().toISOString().split('T')[0];
mealDate.value = today;
filterDate.value = today;
displayMeals(); // 起動時にデータを一覧表示

// --- フェーズ4: 記録する（新規追加・編集保存）ボタンのクリックイベント ---
addBtn.addEventListener('click', function() {
    if (!mealMenu.value) { alert("メニューを入力してください"); return; } 
    
    if (editId) {
        // --- フェーズ10: 編集確定処理 ---
        const index = meals.findIndex(m => m.id === editId);
        meals[index] = {
            id: editId,
            date: mealDate.value,
            menu: mealMenu.value,
            time: mealTime.value,
            memo: mealMemo.value
        };
        editId = null;
        addBtn.innerText = "記録する";
    } else {
        // --- フェーズ5: 新規データの作成処理 ---
        const newMeal = { 
            id: Date.now(), 
            date: mealDate.value, 
            menu: mealMenu.value, 
            time: mealTime.value, 
            memo: mealMemo.value 
        };
        meals.push(newMeal);
    }
    
    save(); // フェーズ7へ
    mealMenu.value = ''; 
    mealMemo.value = '';
    displayMeals(); // フェーズ9へ
});

// --- フェーズ6: フィルタ・全消去の操作イベント ---
filterDate.addEventListener('change', displayMeals);
showAllBtn.addEventListener('click', () => { filterDate.value = ""; displayMeals(); });
clearAllBtn.addEventListener('click', () => { 
    if(confirm("全消去しますか？")){ meals = []; save(); displayMeals(); }
});

// --- フェーズ7: ローカルストレージへの保存処理 ---
function save() { 
    localStorage.setItem('myMeals', JSON.stringify(meals)); 
}

// --- フェーズ8: データの表示と要素の生成 ---
function displayMeals() {
    mealList.innerHTML = ''; 
    totalCountDisplay.innerText = `合計記録数: ${meals.length}件`; 
    
    const targetDate = filterDate.value;
    const filteredMeals = meals.filter(item => !targetDate || item.date === targetDate);

    // 日付ごとにグループ化（内部的な整理）
    const groups = {};
    filteredMeals.forEach(item => { 
        if (!groups[item.date]) groups[item.date] = [];
        groups[item.date].push(item);
    });

    for (const date in groups) {
        const section = document.createElement('div');
        section.className = 'date-section';
        section.innerHTML = `<h2 class="date-title">${date}</h2>`;
        
        const row = document.createElement('div');
        row.className = 'meal-row';

        groups[date].forEach(item => {
            const div = document.createElement('div');
            div.className = 'meal-item';
            div.innerHTML = `
                <p><strong>[${item.time}]</strong></p>
                <p>${item.menu}</p>
                <p><small>${item.memo || ""}</small></p>
            `;

            // ボタン配置用のコンテナ作成
            const btnGroup = document.createElement('div');
            btnGroup.style.display = 'flex';
            btnGroup.style.gap = '10px';
            btnGroup.style.marginTop = 'auto';
            btnGroup.style.width = '100%';
            btnGroup.style.justifyContent = 'center';

            // --- フェーズ10: 編集ボタンの作成と挙動 ---
            const editBtn = document.createElement('button');
            editBtn.innerText = '編集';
            editBtn.className = 'edit-btn';
            editBtn.style.cursor = 'pointer';
            editBtn.onclick = () => {
                mealDate.value = item.date;
                mealMenu.value = item.menu;
                mealTime.value = item.time;
                mealMemo.value = item.memo;
                editId = item.id;
                addBtn.innerText = "更新する";
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
            };

            // --- フェーズ9: 削除ボタンの作成と挙動 ---
            const delBtn = document.createElement('button');
            delBtn.innerText = '削除'; 
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => { 
                if(confirm("削除しますか？")) {
                    meals = meals.filter(m => m.id !== item.id);
                    save(); 
                    displayMeals(); 
                }
            };

            btnGroup.appendChild(editBtn);
            btnGroup.appendChild(delBtn);
            div.appendChild(btnGroup);
            row.appendChild(div);
        });
        section.appendChild(row);
        mealList.appendChild(section);
    }
}