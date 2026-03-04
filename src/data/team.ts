interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  image?: string
  instagram?: string
  linkedin?: string
}

interface TeamSection {
  title: string
  members: TeamMember[]
}


const gdrive = (id: string) => `https://drive.google.com/thumbnail?id=${id}`

export const TEAM_SECTIONS: TeamSection[] = [
  {
    title: 'Overall Coordinator',
    members: [
      { id: 1, name: 'Hardeep Gupta', role: 'Overall Coordinator', bio: '', image: gdrive('1vO-r3coAjZG79ZFE70Cth8r2Qob5B_Ni') },
    ],
  },
  {
    title: 'Planning & Management',
    members: [
      { id: 2, name: 'Priyanka', role: 'Head', bio: '', image: gdrive('1LxVMVfVN-HJrJr_7doa31WnqVHQJ_dBH') },
      { id: 3, name: 'Aditya', role: 'Head', bio: '', image: gdrive('10zZSYs7v9ryc2AwVHW7P2kEawp2ujbDr'), instagram: 'https://www.instagram.com/adityaaaaaaa.k', linkedin: 'https://www.linkedin.com/in/aditya-kumar-53473831a' },
      { id: 4, name: 'Abhinn Goyal', role: 'Head', bio: '', image: gdrive('1kF7fRa7TYBR2TyANvQTS1Gj8-ZrL1eR_'), instagram: 'https://www.instagram.com/abhinn_14', linkedin: 'https://www.linkedin.com/in/abhinn-goyal' },
      { id: 5, name: 'Shivam Rawat', role: 'Head', bio: '', image: gdrive('1C2MVNsw4GSNiS7GcL2UDyk4xyuswfPRO') },
    ],
  },
  {
    title: 'Content',
    members: [
      { id: 6, name: 'Radhika', role: 'Head', bio: '', image: gdrive('1FcGfxJMKNLIyiWGfSdeSFf30J6GASRxK'), instagram: 'https://www.instagram.com/radhee29_', linkedin: 'https://www.linkedin.com/in/radhika-dwivedi-bb39b9320' },
      { id: 7, name: 'Samridhi', role: 'Head', bio: '', image: gdrive('1_n-2uCoZXbN8BcZVFqmHVY7ChUhRFkYc'), instagram: 'https://www.instagram.com/_samridhi_._singh_' },
      { id: 8, name: 'Aakansha', role: 'Head', bio: '', image: gdrive('1w_invUV9iGvtT0l1zZPHjtOQiWRFhU1q'), linkedin: 'https://www.linkedin.com/in/aakansha-sehrawat-141526315/' },
    ],
  },
  {
    title: 'Design',
    members: [
      { id: 9, name: 'Ansh Vyas', role: 'Head', bio: '', image: gdrive('1J8R6sWMB93qVUdQ8gWg2ISLIO9Dsjo2R'), instagram: 'https://www.instagram.com/titan_ansh/', linkedin: 'https://www.linkedin.com/in/ansh-vyas-b74396323/' },
      { id: 10, name: 'Pratibha', role: 'Head', bio: '', image: gdrive('1f817ZucVZdiuN56Ro39EVUlFBw10n_-a'), instagram: 'https://www.instagram.com/pratibha_bt', linkedin: 'https://www.linkedin.com/in/pratibha-bharti-thapliyal-117805324' },
    ],
  },
  {
    title: 'Media',
    members: [
      { id: 11, name: 'Vidisha Thokal', role: 'Head', bio: '', image: gdrive('1xnCPuFIia4v_P0OPYvsuVSavjNgkl7v9'), instagram: 'https://www.instagram.com/vidishaaa_04', linkedin: 'https://www.linkedin.com/in/vidisha-thokal-8a16a5323' },
    ],
  },
  {
    title: 'Publicity',
    members: [
      { id: 12, name: 'Himanshi Namdev', role: 'Head', bio: '', image: gdrive('1OPl1kVmKpw8wi6ak2RQaglDfSKfy_XnH'), linkedin: 'https://www.linkedin.com/in/himanshi-namdev-640595320/' },
      { id: 13, name: 'Suman Chauhan', role: 'Head', bio: '', image: gdrive('1xS3wnLO7ByjglalgcztxHGPAIZ_at5Ri') },
      { id: 14, name: 'Ayush Chauhan', role: 'Head', bio: '', image: gdrive('1ZabuNpwbHNjk0Sik8NqEqKwIQnHqv-xI'), instagram: 'https://www.instagram.com/a_chauhan117' },
    ],
  },
  {
    title: 'Photography & Videography',
    members: [
      { id: 15, name: 'Ishaan Sharma', role: 'Head', bio: '', image: gdrive('1SAW40dVfuge2_pAB8ncaO-4Cklp8agKF'), instagram: 'https://www.instagram.com/ishaannnn.10', linkedin: 'https://www.linkedin.com/in/ishaan-sharma-025bb524b' },
      { id: 16, name: 'Yash Vardhan Chaudhary', role: 'Head', bio: '', image: gdrive('17r_tkqDOZw4Mu9-kaQUqo8toEYwq9Do-'), instagram: 'https://www.instagram.com/yash_vc__', linkedin: 'https://www.linkedin.com/in/yash-vardhan-chaudhary-a1bb2431b' },
    ],
  },
  {
    title: 'Hospitality',
    members: [
      { id: 17, name: 'Chirag', role: 'Head', bio: '', image: gdrive('129gaYHGrFR9PWg9dEFFu2OTYYnjhKjBG'), instagram: 'https://www.instagram.com/chirag_._n' },
      { id: 18, name: 'Vaishnavi Garg', role: 'Head', bio: '', image: gdrive('1ihdXEkFAcNKO4qz_0kdVmBto-PCXjiK8'), instagram: 'https://www.instagram.com/vaishnavi.garg07', linkedin: 'https://www.linkedin.com/in/vaishnavi-garg-592a6b31b' },
      { id: 19, name: 'Chetan', role: 'Head', bio: '', image: gdrive('15JA9dYp05cLyl-Wvh8hNDHnWr2zHHtgU'), linkedin: 'https://www.linkedin.com/in/chetan-meena-65b336324' },
    ],
  },
  {
    title: 'Sponsorship',
    members: [
      { id: 20, name: 'Aadi Baraiya', role: 'Head', bio: '', image: gdrive('1UUWg5cy4H-DXsSomKnYwjf_gBeFIjElJ'), instagram: 'https://www.instagram.com/aadi_jain_baraiya', linkedin: 'https://www.linkedin.com/in/aadi-jain-baraiya-a25b6b337' },
      { id: 21, name: 'Shakshi Sharma', role: 'Head', bio: '', image: gdrive('176DI-qQy7p8_NhRoBEy14e6EC5xgn1QQ') },
    ],
  },
  {
    title: 'Decor',
    members: [
      { id: 22, name: 'Aashvi Garg', role: 'Head', bio: '', image: gdrive('1BGE_Ci1ll_3NFPTx5tPw1DeLG0GkRyYL') },
    ],
  },
]
