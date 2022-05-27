import Head from 'next/head'
import { io } from 'socket.io-client'
import styles from '../styles/Video.module.css'


import { useEffect, useRef, useState } from 'react'
import { Button } from 'react-bootstrap';


function Video() {
    const peerRef = useRef()
    const localStream = useRef()
    const remoteStream = useRef()
    const [peerID, setPeerID] = useState()

    useEffect(() => {


        import("peerjs").then(({ default: Peer }) => {


            const peer = new Peer({});

            peer.on('open', id => {

                setPeerID(id)

            })

            peer.on('connection', function (conn) {
                console.log(conn);
                conn.on('data', function (data) {

                    console.log(data);

                });
            });

            peer.on('call', function (call) {
                var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                getUserMedia({ video: true, audio: true }, function (stream) {
                    localStream.current.srcObject = stream
                    call.answer(stream);
                    call.on('stream', function (stream) {
                        remoteStream.current.srcObject = stream
                        console.log(stream);
                    });
                }, function (err) {
                    console.log('Failed to get local stream', err);
                });
            });

            peerRef.current = peer


        })


    }, [])

    const createRoom = (event) => {

        event.preventDefault()

        const socket = io("http://localhost:5000")

        console.log(peerID);
        socket.emit("create-room", "gopinaths16", peerID)

        socket.on("peer-joined", ID => {

            console.log("Peer joined: " + ID);
            // var conn = peerRef.current.connect(ID);

            // console.log(conn);
            // conn.on('open', function () {

            //   console.log("hi");
            //   conn.send('hi!')

            // });
            var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            getUserMedia({ video: true, audio: true }, function (stream) {
                localStream.current.srcObject = stream
                var call = peerRef.current.call(ID, stream);
                call.on('stream', function (stream) {
                    remoteStream.current.srcObject = stream
                    console.log(stream);
                });
            }, function (err) {
                console.log('Failed to get local stream', err);
            });

        })



    }

    const joinRoom = (event) => {

        event.preventDefault()

        const socket = io("http://localhost:5000")

        console.log(peerID);
        socket.emit("join-room", "gopinaths16", peerID)

        socket.on("other-peer", ID => {

            console.log("Other peer: " + ID);

        })

        socket.on("room-full", message => {

            console.log(message);

        })


    }



    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <div className={styles.sidebar}>

                </div>
                <div>
                    <div className={styles.mainFrame}>
                        <div className={styles.videoFrame}>
                            <video className={styles.videoLocal} id='localStream' ref={localStream} autoPlay playsInline></video>
                            <video className={styles.videoRemote} id='remtoreStream' ref={remoteStream} autoPlay playsInline></video>
                        </div>
                        <div className={styles.buttonGroup}>
                            <Button className={styles.button} onClick={(event) => createRoom(event)}>createRoom</Button>
                            <Button className={styles.button} onClick={(event) => joinRoom(event)}>joinRoom</Button>
                        </div>
                    </div>
                </div>
            </main>


        </div>
    )
}

export default Video