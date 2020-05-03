
const host = 'localhost' ||'127.0.0.1'
var express = require('express')
const app = express()
const port = 3123||process.env.PORT
const http = require('http').createServer(app)
var body_parser = require('body-parser')
var io = require('socket.io')(http)

app.get('/',(req,res, next)=>{
    res.sendFile(__dirname+'/index.html')
})

var server = http.listen(port,host,(err)=>{
    if(err){
        throw err
    }else{
        console.log('Crispen\'s server has started on port: '+ port)
        console.log('url: http://%s:%s/',server.address().address, server.address().port)
    }
})
// Global variables

var n_userconnectet =0;
var user_names =[]
io.on('connection',(socket)=>{
    n_userconnectet++;
    console.log('One user Join')
    console.log(n_userconnectet+" user(s) are now connected")
    io.sockets.emit('nOnline', n_userconnectet)
    socket.on('disconnect',()=>{
        --n_userconnectet;
        console.log('One user left')
        io.sockets.emit('nOnline', n_userconnectet)
        console.log(n_userconnectet+" user(s) are now connected")
    })
    socket.on('setUser', (data)=>{
        if(user_names.indexOf(data)>-1){
            socket.emit('userExist', data+" is already taken try another one")
        }else{
            user_names.push(data)
            socket.emit('userSet', data)
        }
    })
    /// broadcasting messages
    socket.on('Msg', (data)=>{
        io.sockets.emit('newmsg', (data))
    })
    socket.on('database', data=>{
        // Mongodb database 
        var mongoClient = require('mongodb')
        var url='mongodb://localhost/'
        mongoClient.MongoClient.connect(url,(err, db)=>{
            if(err){
                throw err
            }else{
                var databaseObject = db.db('mydatabase')
                const insertOne=(err, res)=>{
                    if(err){
                        throw err
                    }else{
                        console.log(res.ops)
                        console.log(res.insertedCount +": are added in the database users")
                    }
                    db.close()
                }
                databaseObject.collection('users').insertOne(data, insertOne)
            }
        })
    })
})
