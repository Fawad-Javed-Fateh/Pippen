const express=require('express')
const path=require('path')
const app=express()
const upload=require('express-fileupload')
const fs=require('fs')
const bodyParser=require('body-parser')

app.set('view engine','ejs')

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname + '/public'));
app.use(upload())
var selectedFile=""


app.get('/',(req,res)=>{
    res.render('home')
})

app.post('/UploadVideo',(req,res)=>{
    res.render('upload')
})
app.post('/WatchVideo',(req,res)=>{
    var list=[]
    fs.readdir('./uploads/',(err,files)=>{
        files.forEach(file=>{
            console.log(file)
            list.push(file)
        })
        console.log(list)
        res.render('videolist',{List:list})
    })
    
})

app.post('/playvideo',(req,res)=>{
    var checked=req.body.checked
    console.log('istinja')
    console.log(checked)
    selectedFile=path.join(__dirname+'/uploads/'+checked[0])
    console.log(selectedFile)
    res.redirect('http://192.168.0.103:3000/video') /* change this to your own computers up address as well as the port you have specified later on in the code  */
    
})

app.get('/video',(req,res)=>{
    let range = req.headers.range
    if(!range) range = 'bytes=0-'

    console.log(typeof(range))
    const videoPath=selectedFile
    const videoSize=fs.statSync(selectedFile).size
    console.log(videoSize)
    const chunk=1 *1e6
    const start= Number(range.replace(/\D/g, ""))
    const last=Math.min(start+chunk,videoSize-1)
    const length=last-start+1
    const headers={
        "Content-Range":`bytes ${start}-${last}/${videoSize} `,
        'Accept-Ranges':"bytes",
        "Content-Length":length,
        'Content-Type':'video/mp4',
    }    
    res.writeHead(206,headers)
    const videoStream=fs.createReadStream(videoPath,{start,last})
    videoStream.pipe(res)
})

app.post('/uploaded',(req,res)=>{
    if(req.files){
        var file=req.files.file
        var filename=file.name
        console.log(file)
        file.mv('./uploads/'+ filename,function(err){
            if(err){
                res.send(err)
            }
            else{
                console.log('back to life')
                res.render('home')
            }
        })
    }
    
})


app.listen("3000")
