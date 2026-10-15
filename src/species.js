export const SPECIES = [
  {id:'goldfish',name:'Cá vàng',description:'Thân tròn, đuôi quạt',body:[.42,.25,.16],tail:.33,dorsal:.25,colors:['#fff2d2','#eea13e','#a65526'],speed:.16,size:1.3},
  {id:'neon',name:'Cá neon',description:'Nhỏ, sọc xanh ngọc',body:[.36,.105,.075],tail:.17,dorsal:.10,colors:['#d0e2d8','#3c8888','#22444c'],speed:.25,size:.85},
  {id:'angelfish',name:'Cá thần tiên',description:'Thân dẹp, vây cao',body:[.29,.36,.09],tail:.23,dorsal:.48,colors:['#e6e2cf','#b5b29c','#575d57'],speed:.12,size:1.25},
  {id:'discus',name:'Cá đĩa',description:'Thân tròn, hoa văn lam',body:[.33,.36,.10],tail:.16,dorsal:.16,colors:['#bacfc2','#639ea3','#395c6a'],speed:.10,size:1.4},
  {id:'guppy',name:'Cá bảy màu',description:'Đuôi xòe rực rỡ',body:[.29,.115,.075],tail:.38,dorsal:.22,colors:['#e1d7c2','#ad9772','#58695f'],speed:.23,size:.9},
  {id:'koi',name:'Cá koi',description:'Thân dài, khoang đỏ trắng',body:[.55,.19,.16],tail:.27,dorsal:.18,colors:['#f1ead7','#dfd6bd','#bda98b'],speed:.13,size:1.2},
  {id:'betta',name:'Cá betta',description:'Vây dài, đuôi lụa',body:[.33,.17,.10],tail:.42,dorsal:.30,colors:['#9ab6c5','#4b7197','#263d64'],speed:.11,size:1.1},
  {id:'cory',name:'Cá chuột',description:'Bơi thấp sát nền cát',body:[.32,.15,.125],tail:.17,dorsal:.23,colors:['#d3c4a3','#94846b','#514b3e'],speed:.13,size:1}
];
export function speciesById(id){return SPECIES.find(s=>s.id===id)||SPECIES[0]}
