function encode_simple(af, text){ // ★ データ出力
    //encf is 240 array field, ac is comment, enc
    ac = [text]

    

    ct = 1
    fldlines=24
    enctbl = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    asctbl=' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
    enc = []
    enc.length = 240
    for(j=0;j<240;j++)enc[j]=0
    encf = []
    encf.length = 240
    for(i=0;i<240;i++)encf[i]=0;
    encc=0;
    fldrepaddr=-1;
    
    e=0
      // フィールド出力
      for(j=0;j<240;j++)encf[j]=af[j]+8-encf[j];
      fc=0;
      for(j=0;j<240-1;j++){
        fc++;
        if(encf[j]!=encf[j+1]){
          tmp=encf[j]*240+(fc-1);
          enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
          enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
          fc=0;
        }
      }
      fc++;
      tmp=encf[j]*240+(fc-1);
      enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
      enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
      fc=0;
      if(enc[encc-2]+enc[encc-1]*64==9*240-1){
        if(fldrepaddr<0){
          fldrepaddr=encc++;enc[fldrepaddr]=0;
        }else{
          if(enc[fldrepaddr]<63){enc[fldrepaddr]++;encc-=2;}else{fldrepaddr=encc++;enc[fldrepaddr]=0;}
        }
      }else{
        if(fldrepaddr>=0)fldrepaddr=-1;
      }
      console.log( enc)
      
      // タイプ,角度,座標出力
      cmstrrep=(e>0)?ac[e-1]:'';
      cmstrrep=escape(cmstrrep).substring(0,4095);
      tmpstr=escape(ac[e]).substring(0,4095);
      tmplen=tmpstr.length;
      if(tmplen>4095)tmplen=4095;
      tmp=(ac[0]=='')? 30720 :92160 
      enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
      enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
      enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
      console.log( enc)
      // コメント出力
      if(tmpstr!=cmstrrep){
        tmp=tmplen;
        enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
        enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
        for(i=0;i<tmplen;i+=4){
          tmp=(((ins=asctbl.indexOf(tmpstr.charAt(i+0)))>=0?ins:0)%96);
          tmp+=(((ins=asctbl.indexOf(tmpstr.charAt(i+1)))>=0?ins:0)%96)*96;
          tmp+=(((ins=asctbl.indexOf(tmpstr.charAt(i+2)))>=0?ins:0)%96)*9216;
          tmp+=(((ins=asctbl.indexOf(tmpstr.charAt(i+3)))>=0?ins:0)%96)*884736;
          enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
          enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
          enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
          enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
          enc[encc++]=tmp%64;tmp=Math.floor(tmp/64);
        }
      }

      if(true){ // ミノ接着
        
        // フィールドずらし消去
        for(i=fldlines-2,k=fldlines-2;k>=0;k--){
          chk=0;for(j=0;j<10;j++)chk+=(encf[k*10+j]>0);
          if(chk<10){
            for(j=0;j<10;j++)encf[i*10+j]=encf[k*10+j];
            i--;
          }
        }
        for(;i>=0;i--)for(j=0;j<10;j++)encf[i*10+j]=0;
        
      }
    
    encstr='v115@';
    for(i=0;i<encc;i++){
      encstr=encstr+enctbl.charAt(enc[i]);
    if(i%47==41)encstr=encstr+"?";
    }
    console.log(encstr, enc)
    return encstr


  }
  raw0 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ac0 = 'abc'
  raw1 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,8,8,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,8,8,0,8,8,0,0,0,0,0,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ac1=''
  raw2=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,8,8,0,0,0,0,0,8,8,8,8,8,0,0,0,0,8,8,8,8,8,8,0,0,0,8,8,8,8,8,8,8,0,0,0,0,8,8,8,0,0,0,0,0,0,0,0,0,0]
  encode_simple(raw2,ac0)