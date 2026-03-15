import adityaTayal from '../assets/team/dp/AdityaTayal.jpeg'

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
    title: 'Overall Coordinators',
    members: [
      { id: 43, name: 'Rana Rohitashav Gehloch', role: 'Organising Secretary', bio: '', image: gdrive('1QxOfJT3G74OK8ldHYz4AvakOtqnsnz8m') },
      { id: 1, name: 'Hardeep Gupta', role: 'Convenor', bio: '', image: gdrive('1vO-r3coAjZG79ZFE70Cth8r2Qob5B_Ni') },
    ],
  },
  {
    title: 'Co-Convenor',
    members: [
      { id: 2, name: 'Abhigyan Bhartariya', role: 'Co-Convenor', bio: '', image: gdrive('1j2z_sTLE1qy2GrWAJlHtxYqv6sM7NNTw'), instagram: 'https://www.instagram.com/abhigyan8611', linkedin: 'https://www.linkedin.com/in/abhigyan-bhartariya-73267928a' },
      { id: 3, name: 'Manjeet Rai', role: 'Co-Convenor', bio: '', image: gdrive('1wtqtP_vnH6YilQ5w0v26dl1_48lbPgYU') },
      { id: 4, name: 'Yadnyit Panchbhai', role: 'Co-Convenor', bio: '', image: gdrive('1RGBrYuN8Kd-VIrzqkFurgB001WCSi1SX'), instagram: 'https://www.instagram.com/yadnyit_07', linkedin: 'https://www.linkedin.com/in/yadnyit-panchbhai-10aa28292' },
    ],
  },
  {
    title: 'Sponsorship',
    members: [
      { id: 5, name: 'Aadi Baraiya', role: 'Head', bio: '', image: gdrive('1UUWg5cy4H-DXsSomKnYwjf_gBeFIjElJ'), instagram: 'https://www.instagram.com/aadi_jain_baraiya', linkedin: 'https://www.linkedin.com/in/aadi-jain-baraiya-a25b6b337' },
      { id: 6, name: 'Shakshi Sharma', role: 'Head', bio: '', image: gdrive('176DI-qQy7p8_NhRoBEy14e6EC5xgn1QQ') },
      { id: 39, name: 'Kavya Shah', role: 'Head', bio: '', image: gdrive('14pMnqVHYP6_OXZDvb6uOLaOS5846L5YE'), instagram: 'https://www.instagram.com/kavya_._shah' },
    ],
  },
  {
    title: 'Planning & Management',
    members: [
      { id: 15, name: 'Priyanka', role: 'Head', bio: '', image: gdrive('1LxVMVfVN-HJrJr_7doa31WnqVHQJ_dBH') },
      { id: 16, name: 'Aditya', role: 'Head', bio: '', image: gdrive('10zZSYs7v9ryc2AwVHW7P2kEawp2ujbDr'), instagram: 'https://www.instagram.com/adityaaaaaaa.k', linkedin: 'https://www.linkedin.com/in/aditya-kumar-53473831a' },
      { id: 17, name: 'Abhinn Goyal', role: 'Head', bio: '', image: gdrive('1nfzANgfd4g0W6Fw-F64Yy3g4ZaIli4RX'), instagram: 'https://www.instagram.com/abhinn_14', linkedin: 'https://www.linkedin.com/in/abhinn-goyal' },
      { id: 18, name: 'Shivam Rawat', role: 'Head', bio: '', image: gdrive('1C2MVNsw4GSNiS7GcL2UDyk4xyuswfPRO') },
      { id: 19, name: 'Tanisha Singh', role: 'Head', bio: '', image: gdrive('1tvmgvNvlfmh2vsIVdT-8xqB7ev4sonAZ'), instagram: 'https://www.instagram.com/tanisha187596', linkedin: 'https://www.linkedin.com/in/tanisha-singh-00138634b' },
      { id: 37, name: 'Shubham Kumar', role: 'Head', bio: '', image: gdrive('1K_zaDR1qNd_OJfRGv7m3f5Jai4VZlqfH'), instagram: 'https://www.instagram.com/suv_nayan' },
    ],
  },
  {
    title: 'Publicity',
    members: [
      { id: 7, name: 'Himanshi Namdev', role: 'Head', bio: '', image: gdrive('1OPl1kVmKpw8wi6ak2RQaglDfSKfy_XnH'), linkedin: 'https://www.linkedin.com/in/himanshi-namdev-640595320/' },
      { id: 8, name: 'Suman Chauhan', role: 'Head', bio: '', image: gdrive('1xS3wnLO7ByjglalgcztxHGPAIZ_at5Ri') },
      { id: 9, name: 'Ayush Chauhan', role: 'Head', bio: '', image: gdrive('1ZabuNpwbHNjk0Sik8NqEqKwIQnHqv-xI'), instagram: 'https://www.instagram.com/a_chauhan117' },
      { id: 10, name: 'Devom Garg', role: 'Head', bio: '', image: gdrive('1h1MN1-7be8bJ9g6e1ILeupW9239xCuBZ'), instagram: 'https://www.instagram.com/devom_516' },
      { id: 41, name: 'Krrish Rathor', role: 'Head', bio: '', image: gdrive('1RMvB-nMrMNv0eBiAYjL3SKZDe-d09uvn'), instagram: 'https://www.instagram.com/krrishhh.29', linkedin: 'https://www.linkedin.com/in/krrish-rathore-691819325' },
    ],
  },
  {
    title: 'Design',
    members: [
      { id: 11, name: 'Ansh Vyas', role: 'Head', bio: '', image: gdrive('1J8R6sWMB93qVUdQ8gWg2ISLIO9Dsjo2R'), instagram: 'https://www.instagram.com/titan_ansh/', linkedin: 'https://www.linkedin.com/in/ansh-vyas-b74396323/' },
      { id: 12, name: 'Pratibha', role: 'Head', bio: '', image: gdrive('1f817ZucVZdiuN56Ro39EVUlFBw10n_-a'), instagram: 'https://www.instagram.com/pratibha_bt', linkedin: 'https://www.linkedin.com/in/pratibha-bharti-thapliyal-117805324' },
      { id: 38, name: 'Ashutosh Pandey', role: 'Head', bio: '', image: gdrive('1ATsZbOnlLp-ObE5VFZlQwbj5wp_5FIjf'), instagram: 'https://www.instagram.com/ashutosh__06__/' },
    ],
  },
  {
    title: 'Web Dev',
    members: [
      { id: 13, name: 'Saksham Setia', role: 'Head', bio: '', image: gdrive('1vvHFneyIx_gkvkdwYsnbhiO11-SMfDLG'), instagram: 'https://www.instagram.com/setiasaksham13', linkedin: 'https://www.linkedin.com/in/saksham-setia-187281310' },
      { id: 14, name: 'Kumar Saurav', role: 'Head', bio: '', image: gdrive('1qkN_U41gz4kvL6G6wys_UiPF4Qz3cXU5'), instagram: 'https://www.instagram.com/saurav10101010', linkedin: 'https://www.linkedin.com/in/kumar-saurav-417508323' },
      { id: 36, name: 'Aditya Tayal', role: 'Head', bio: '', image: adityaTayal, instagram: 'https://instagram.com/adityatayal1', linkedin: 'https://www.linkedin.com/in/tayal-aditya' },
    ],
  },
  {
    title: 'Photography & Videography',
    members: [
      { id: 20, name: 'Ishaan Sharma', role: 'Head', bio: '', image: gdrive('1SAW40dVfuge2_pAB8ncaO-4Cklp8agKF'), instagram: 'https://www.instagram.com/ishaannnn.10', linkedin: 'https://www.linkedin.com/in/ishaan-sharma-025bb524b' },
      { id: 21, name: 'Yash Vardhan Chaudhary', role: 'Head', bio: '', image: gdrive('17r_tkqDOZw4Mu9-kaQUqo8toEYwq9Do-'), instagram: 'https://www.instagram.com/yash_vc__', linkedin: 'https://www.linkedin.com/in/yash-vardhan-chaudhary-a1bb2431b' },
      { id: 22, name: 'Manmeet Kaur', role: 'Head', bio: '', image: gdrive('1UgviTlMxaxEYcKw_DlZo6-SdQAJ1ohqy'), instagram: 'https://www.instagram.com/manmeettt13', linkedin: 'https://www.linkedin.com/in/manmeet-kaur-550139309' },
      { id: 40, name: 'Saanvi Mendiratta', role: 'Head', bio: '', image: gdrive('19hXOa7dzNPOGQhfQxH3YcHM9GO5KnO2_') },
    ],
  },
  {
    title: 'Decor',
    members: [
      { id: 23, name: 'Aashvi Garg', role: 'Head', bio: '', image: gdrive('1BGE_Ci1ll_3NFPTx5tPw1DeLG0GkRyYL') },
      { id: 24, name: 'Mihir Yadav', role: 'Head', bio: '', image: gdrive('1NIxoj3EVeEiXdaRg92ZrOmZ8Uclddo7_') },
      { id: 45, name: 'Vinayak Gupta', role: 'Head', bio: '', image: gdrive('1F91C7X26Wso4j42gY8dRqgnvmtGXAJNi'), instagram: 'https://www.instagram.com/_vinayak24', linkedin: 'https://in.linkedin.com/in/vinayak-gupta-740214306' },
    ],
  },
  {
    title: 'Media',
    members: [
      { id: 25, name: 'Vidisha Thokal', role: 'Head', bio: '', image: gdrive('1xnCPuFIia4v_P0OPYvsuVSavjNgkl7v9'), instagram: 'https://www.instagram.com/vidishaaa_04', linkedin: 'https://www.linkedin.com/in/vidisha-thokal-8a16a5323' },
      { id: 26, name: 'Ansuman Panda', role: 'Head', bio: '', image: gdrive('1GLdE3rf7cKKmpBd3y25M2ogtHGEEIvVC'), instagram: 'https://www.instagram.com/ansuman11055', linkedin: 'https://www.linkedin.com/in/ansuman11055' },
      { id: 27, name: 'Lubdha Jadhao', role: 'Head', bio: '', image: gdrive('1UjCZSCiMJs6utA-5ffQ2Q0UjeibHM7CN') },
    ],
  },
  {
    title: 'Content',
    members: [
      { id: 28, name: 'Radhika', role: 'Head', bio: '', image: gdrive('1FcGfxJMKNLIyiWGfSdeSFf30J6GASRxK'), instagram: 'https://www.instagram.com/radhee29_', linkedin: 'https://www.linkedin.com/in/radhika-dwivedi-bb39b9320' },
      { id: 29, name: 'Samridhi', role: 'Head', bio: '', image: gdrive('1_n-2uCoZXbN8BcZVFqmHVY7ChUhRFkYc'), instagram: 'https://www.instagram.com/_samridhi_._singh_' },
      { id: 30, name: 'Aakansha', role: 'Head', bio: '', image: gdrive('1w_invUV9iGvtT0l1zZPHjtOQiWRFhU1q'), linkedin: 'https://www.linkedin.com/in/aakansha-sehrawat-141526315/' },
    ],
  },
  {
    title: 'Hospitality',
    members: [
      { id: 31, name: 'Chirag', role: 'Head', bio: '', image: gdrive('129gaYHGrFR9PWg9dEFFu2OTYYnjhKjBG'), instagram: 'https://www.instagram.com/chirag_._n' },
      { id: 32, name: 'Vaishnavi Garg', role: 'Head', bio: '', image: gdrive('1ihdXEkFAcNKO4qz_0kdVmBto-PCXjiK8'), instagram: 'https://www.instagram.com/vaishnavi.garg07', linkedin: 'https://www.linkedin.com/in/vaishnavi-garg-592a6b31b' },
      { id: 33, name: 'Chetan', role: 'Head', bio: '', image: gdrive('15JA9dYp05cLyl-Wvh8hNDHnWr2zHHtgU'), linkedin: 'https://www.linkedin.com/in/chetan-meena-65b336324' },
      { id: 42, name: 'Abhishek', role: 'Head', bio: '', image: gdrive('1aj_Knt4wpQLUcYt0-2wR8IWXn-gBH4Dp'), instagram: 'https://www.instagram.com/abhishek_rj_05/' },
    ],
  },
  {
    title: 'Security',
    members: [
      { id: 34, name: 'Arani Ghosh', role: 'Head', bio: '', image: gdrive('14NK2hl4G124zNz82folgYiEYmtatHvKa') },
      { id: 35, name: 'Mohit', role: 'Head', bio: '', image: gdrive('140cCXK-QXyPokjQMcz3lfSEB-lMciUoe'), instagram: 'https://www.instagram.com/mohitsinghmar3009' },
      { id: 44, name: 'Ajeet Yadav', role: 'Head', bio: '', image: gdrive('14DH-G2cVoz4xJZNPe57lNwvwzcFB-lfb') },
    ],
  },
]