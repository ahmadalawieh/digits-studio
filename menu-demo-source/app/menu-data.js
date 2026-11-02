export const categories = [
 {id:'all',ar:'الكل',en:'All'}, {id:'burgers',ar:'برغر',en:'Burgers'},
 {id:'pizza',ar:'بيتزا',en:'Pizza'}, {id:'drinks',ar:'مشروبات',en:'Drinks'}
];

export const items = [
 {id:'double-cheese',category:'burgers',price:9,image:'burger-classic.jpg',position:'50% 57%',
  ar:{name:'دبل تشيز برغر',short:'قطعتين لحمة، تشيدر وخضرة.',description:'قطعتين برغر، جبنة تشيدر، خسّ، بندورة وبصل، بخبزة سمسم. مع بطاطا عَ الجنب.',ingredients:'لحمة، تشيدر، خسّ، بندورة، بصل، خبز سمسم وبطاطا.',note:'بيحتوي على قمح، حليب وسمسم.'},
  en:{name:'Double cheeseburger',short:'Two patties, cheddar and greens.',description:'Two beef patties, cheddar, lettuce, tomato and onion in a sesame bun. Served with fries.',ingredients:'Beef, cheddar, lettuce, tomato, onion, sesame bun and fries.',note:'Contains wheat, milk and sesame.'}},
 {id:'margherita',category:'pizza',price:10,image:'pizza-whole.jpg',position:'50% 64%',
  ar:{name:'بيتزا مارغريتا',short:'موزاريلا، بندورة وريحان.',description:'عجينة بيتزا مخبوزة، صلصة بندورة، موزاريلا وأوراق ريحان.',ingredients:'عجينة بيتزا، بندورة، موزاريلا وريحان.',note:'بيحتوي على قمح وحليب.'},
  en:{name:'Margherita pizza',short:'Mozzarella, tomato and basil.',description:'Baked pizza dough with tomato sauce, mozzarella and fresh basil leaves.',ingredients:'Pizza dough, tomato, mozzarella and basil.',note:'Contains wheat and milk.'}},
 {id:'iced-latte',category:'drinks',price:4,image:'latte.jpg',position:'50% 63%',
  ar:{name:'آيس لاتيه',short:'قهوة، حليب وتلج.',description:'قهوة مع حليب وتلج، بكاسة باردة.',ingredients:'قهوة، حليب وتلج.',note:'بيحتوي على حليب.'},
  en:{name:'Iced latte',short:'Coffee, milk and ice.',description:'Coffee with milk and ice, served cold.',ingredients:'Coffee, milk and ice.',note:'Contains milk.'}},
 {id:'mint-lemonade',category:'drinks',price:3.5,image:'lemonade.jpg',position:'50% 42%',contain:true,
  ar:{name:'ليموناضة بالنعنع',short:'ليمون، نعنع وتلج.',description:'ليموناضة باردة مع نعنع وشرحة ليمون.',ingredients:'ليمون، نعنع، ميّ، سكّر وتلج.',note:'اسألوا عن المكوّنات إذا عندكن حساسيّة.'},
  en:{name:'Mint lemonade',short:'Lemon, mint and ice.',description:'Chilled lemonade with mint and a lemon slice.',ingredients:'Lemon, mint, water, sugar and ice.',note:'Ask about ingredients if you have an allergy.'}},
 {id:'coleslaw-burger',category:'burgers',price:8,image:'burger.jpg',position:'50% 50%',
  ar:{name:'برغر كولسلو',short:'تشيدر، كولسلو ومخلّل.',description:'برغر مع جبنة تشيدر، سلطة كولسلو ومخلّل، بخبزة طريّة. مع بطاطا مقرمشة.',ingredients:'برغر، تشيدر، كولسلو، مخلّل، خبز وبطاطا.',note:'بيحتوي على قمح وحليب. اسألوا عن مكوّنات الصوص.'},
  en:{name:'Coleslaw burger',short:'Cheddar, slaw and pickle.',description:'A burger with cheddar, coleslaw and pickle in a soft bun, with crispy potatoes.',ingredients:'Burger patty, cheddar, coleslaw, pickle, bun and potatoes.',note:'Contains wheat and milk. Ask about sauce ingredients.'}}
];

export const labels = {
 ar:{title:'المنيو',hello:'شو عبالكن اليوم؟',lead:'اختاروا عَ ذوقكن.',demo:'نموذج تجريبي',search:'ابحثوا عن صنف',clear:'مسح البحث',details:'تفاصيل',back:'رجوع للمنيو',ingredients:'المكوّنات',allergy:'للحساسيّة الغذائية',allergyNote:'اسألوا فريق المطعم عن المكوّنات قبل الاختيار.',detailNote:'وصف ومكوّنات للتوضيح ضمن الديمو.',footer:'الأصناف والصور والأسعار للتوضيح.',currency:'الأسعار بالدولار الأميركي',empty:'ما لقينا هالصنف.',reset:'عرض كل الأصناف',price:'السعر',section:'أصناف المنيو'},
 en:{title:'The menu',hello:'What sounds good?',lead:'Find your favourite.',demo:'Design demo',search:'Find something good',clear:'Clear search',details:'Details',back:'Back to the menu',ingredients:'Ingredients',allergy:'Food allergies',allergyNote:'Ask the restaurant team about ingredients before choosing.',detailNote:'Illustrative description and ingredients for this demo.',footer:'Illustrative dishes, photography and prices.',currency:'Prices in US dollars',empty:'We couldn’t find that item.',reset:'Show all items',price:'Price',section:'Menu categories'}
};
