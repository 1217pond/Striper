document.getElementById("org_file").addEventListener("change",(e)=>{
    file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const img_elm = document.createElement("img");
        img_elm.onload = () => {
            const cvs = document.getElementById("org_prev");
            cvs.width = img_elm.width;
            cvs.height = img_elm.height;
            const ctx = cvs.getContext("2d");
            ctx.drawImage(img_elm,0,0);
        };
        img_elm.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

document.getElementById("trg_file").addEventListener("change",(e)=>{
    file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const img_elm = document.createElement("img");
        img_elm.onload = () => {
            const cvs = document.getElementById("trg_prev");
            cvs.width = img_elm.width;
            cvs.height = img_elm.height;
            const ctx = cvs.getContext("2d");
            ctx.drawImage(img_elm,0,0);
        };
        img_elm.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

function isMaskedPx(x,mask_w,img_w,ofs){
    return (x+ofs)%(mask_w+img_w)<mask_w;
}

function B(x,do_balance){
    return do_balance?Math.min(255,Math.max((x - 127)*2,0)):x;
}

document.getElementById("rest_trg").addEventListener("click",(e)=>{
    const org_cvs = document.getElementById("org_prev");
    const trg_cvs = document.getElementById("trg_prev");
    let width = org_cvs.width = trg_cvs.width;
    let height =org_cvs.height = trg_cvs.height;
    console.log(width,height);
    const org_ctx = org_cvs.getContext("2d");
    const trg_ctx = trg_cvs.getContext("2d");
    let mask_w = Number(document.getElementById("mask_w").value);
    let img_w = Number(document.getElementById("img_w").value);
    let ofs = Number(document.getElementById("offset").value);
    let balance = document.getElementById("balance").checked;
    let method = document.getElementById("method").value;
    console.log(method);
    let org_im_data = org_ctx.getImageData(0,0,width,height);
    let org_data = org_im_data.data;
    let trg_data = trg_ctx.getImageData(0,0,width,height).data;
    console.log(org_data.length,trg_data.length);
    if(document.getElementById("dir").value == "V"){
        for(let y = 0;y<height;y++){
            if(!isMaskedPx(y,mask_w,img_w,ofs)){
                for (var x = 0;x<width;x++) {
                    let base = (y * width + x) * 4;
                    org_data[base] = B(trg_data[base],balance);
                    org_data[base+1] = B(trg_data[base+1],balance);
                    org_data[base+2] = B(trg_data[base+2],balance);
                    org_data[base+3] = 255;
                }
            }else if(method == "N"){
                for (var x = 0;x<width;x++) {
                    let base = (y * width + x) * 4;
                    org_data[base] = B(255-trg_data[base],balance);
                    org_data[base+1] = B(255-trg_data[base+1],balance);
                    org_data[base+2] = B(255-trg_data[base+2],balance);
                    org_data[base+3] = 255;
                }
            }
        }
        if(method == "B"){
            for(let y = 0;y<height;y++){
                if(isMaskedPx(y,mask_w,img_w,ofs)){
                    let upper_idx = y-(y+ofs)%(mask_w+img_w)-1;
                    let downer_idx = upper_idx+mask_w+1;
                    //upperを0,downerを1とした値
                    let ratio = (y-upper_idx)/(mask_w+1);
                    if(upper_idx<0){
                        for (var x = 0;x<width;x++) {
                            let base = (y * width + x) * 4;
                            let downer_base = (downer_idx * width + x) * 4;
                            org_data[base] = B(trg_data[downer_base],balance);
                            org_data[base+1] = B(trg_data[downer_base+1],balance);
                            org_data[base+2] = B(trg_data[downer_base+2],balance);
                            org_data[base+3] = 255;
                        }
                    }else if(downer_idx>=height){
                        for (var x = 0;x<width;x++) {
                            let base = (y * width + x) * 4;
                            let upper_base = (upper_idx * width + x) * 4;
                            org_data[base] = B(trg_data[upper_base],balance);
                            org_data[base+1] = B(trg_data[upper_base+1],balance);
                            org_data[base+2] = B(trg_data[upper_base+2],balance);
                            org_data[base+3] = 255;
                        }
                    }else{
                        for (var x = 0;x<width;x++) {
                            let base = (y * width + x) * 4;
                            let upper_base = (upper_idx * width + x) * 4;
                            let downer_base = (downer_idx * width + x) * 4;
                            org_data[base] = B(Math.round(trg_data[upper_base]*ratio + trg_data[downer_base]*(1-ratio)),balance);
                            org_data[base+1] = B(Math.round(trg_data[upper_base+1]*ratio + trg_data[downer_base+1]*(1-ratio)),balance);
                            org_data[base+2] = B(Math.round(trg_data[upper_base+2]*ratio + trg_data[downer_base+2]*(1-ratio)),balance);
                            org_data[base+3] = 255;
                        }
                    }
                    
                }
            }
        }
        console.log("success");
        org_ctx.putImageData(org_im_data, 0, 0);
    }else{
        for(let x = 0;x<width;x++){
            if(!isMaskedPx(x,mask_w,img_w,ofs)){
                for (var y = 0;y<height;y++) {
                    let base = (y * width + x) * 4;
                    org_data[base] = B(trg_data[base],balance);
                    org_data[base+1] = B(trg_data[base+1],balance);
                    org_data[base+2] = B(trg_data[base+2],balance);
                    org_data[base+3] = 255;
                }
            }else if(method == "N"){
                for (var y = 0;y<height;y++) {
                    let base = (y * width + x) * 4;
                    org_data[base] = B(255-trg_data[base],balance);
                    org_data[base+1] = B(255-trg_data[base+1],balance);
                    org_data[base+2] = B(255-trg_data[base+2],balance);
                    org_data[base+3] = 255;
                }
            }
        }
        if(method == "B"){

            for(let x = 0;x<width;x++){
                if(isMaskedPx(x,mask_w,img_w,ofs)){
                    let upper_idx = x-(x+ofs)%(mask_w+img_w)-1;
                    let downer_idx = upper_idx+mask_w+1;
                    //upperを0,downerを1とした値
                    let ratio = (x-upper_idx)/(mask_w+1);
                    if(upper_idx<0){
                        for (var y = 0;y<height;y++) {
                            let base = (y * width + x) * 4;
                            let downer_base = (y * width + downer_idx) * 4;
                            org_data[base] = B(trg_data[downer_base],balance);
                            org_data[base+1] = B(trg_data[downer_base+1],balance);
                            org_data[base+2] = B(trg_data[downer_base+2],balance);
                            org_data[base+3] = 255;
                        }
                    }else if(downer_idx>=height){
                        for (var y = 0;y<height;y++) {
                            let base = (y * width + x) * 4;
                            let upper_base = (y * width + upper_idx) * 4;
                            org_data[base] = B(trg_data[upper_base],balance);
                            org_data[base+1] = B(trg_data[upper_base+1],balance);
                            org_data[base+2] = B(trg_data[upper_base+2],balance);
                            org_data[base+3] = 255;
                        }
                    }else{
                        for (var y = 0;y<height;y++) {
                            let base = (y * width + x) * 4;
                            let upper_base = (y * width + upper_idx) * 4;
                            let downer_base = (y * width + downer_idx) * 4;
                            org_data[base] = B(Math.round(trg_data[upper_base]*ratio + trg_data[downer_base]*(1-ratio)),balance);
                            org_data[base+1] = B(Math.round(trg_data[upper_base+1]*ratio + trg_data[downer_base+1]*(1-ratio)),balance);
                            org_data[base+2] = B(Math.round(trg_data[upper_base+2]*ratio + trg_data[downer_base+2]*(1-ratio)),balance);
                            org_data[base+3] = 255;
                        }
                    }
                    
                }
            }
        }
        console.log("success");
        org_ctx.putImageData(org_im_data, 0, 0);
    }
});