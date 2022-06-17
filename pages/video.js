import Head from 'next/head'
import { io } from 'socket.io-client'
import styles from '../styles/Video.module.css'


import { useEffect, useRef, useState } from 'react'
import { Button } from 'react-bootstrap';

import { v4 as uuidv4 } from 'uuid';


function Video() {
    const peerRef = useRef()
    const localStream = useRef()
    const remoteStream = useRef()
    const remotePeer = useRef()
    const connRef = useRef()
    const [onlinePointerColor, setOnlinePointerColor] = useState('red')
    const [peerID, setPeerID] = useState()
    const [isDisabled, setIsDisabled] = useState(false)
    const [callButtonIsDisabled, setCallButtonIsDisabled] = useState(true)
    const [hangupIsDisabled, setHangupIsDisabled] = useState(true)
    const roomID = useRef()

    useEffect(() => {


        import("peerjs").then(({ default: Peer }) => {


            roomID.current = uuidv4()
            console.log(roomID.current);
            const peer = new Peer();

            peer.on('open', id => {

                setPeerID(id)

            })

            peer.on('connection', function (conn) {
                console.log(conn);
                conn.on('open', function () {
                    conn.on('data', function (data) {

                        console.log(data);

                    });
                })
            });


            peer.on('call', function (call) {
                setHangupIsDisabled(false)
                connRef.current = call
                var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                getUserMedia({ video: true, audio: true }, function (stream) {
                    localStream.current.srcObject = stream
                    call.answer(stream);
                    call.on('stream', function (stream) {
                        remoteStream.current.srcObject = stream
                        console.log(stream);
                    });
                    call.on('close', function () {
                        console.log("closed");
                        localStream.current.srcObject = null;
                        remoteStream.current.srcObject = null;
                        setCallButtonIsDisabled(false)
                        setHangupIsDisabled(true)
                    })
                }, function (err) {
                    console.log('Failed to get local stream', err);
                });
            });

            peerRef.current = peer


        })


    }, [])

    const createRoom = (event) => {



        event.preventDefault()

        setIsDisabled(true)

        const socket = io("https://0cb2-2401-4900-3607-6da2-2016-841a-d51-d618.in.ngrok.io")

        console.log(peerID);
        socket.emit("create-room", roomID.current, peerID)
        document.querySelector("#description").innerHTML = `Your room id is ${roomID.current}`

        socket.on("peer-joined", ID => {

            console.log("Peer joined: " + ID);
            document.querySelector("#description").innerHTML = `Connection created with peer ${ID}`
            setCallButtonIsDisabled(false)
            setOnlinePointerColor("green")
            // var conn = peerRef.current.connect(ID);

            // console.log(conn);
            // conn.on('open', function () {

            //   console.log("hi");
            //   conn.send('hi!')

            // });
            remotePeer.current = ID;
            // var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            // getUserMedia({ video: true, audio: true }, function (stream) {
            //     localStream.current.srcObject = stream
            //     var call = peerRef.current.call(ID, stream);
            //     call.on('stream', function (stream) {
            //         remoteStream.current.srcObject = stream
            //         console.log(stream);
            //     });
            // }, function (err) {
            //     console.log('Failed to get local stream', err);
            // });

        })



    }

    const joinRoom = (event) => {

        event.preventDefault()
        setIsDisabled(true)

        const socket = io("https://0cb2-2401-4900-3607-6da2-2016-841a-d51-d618.in.ngrok.io")

        console.log(peerID);

        const room = prompt("Enter room id to join a room!")
        socket.emit("join-room", room, peerID)

        socket.on("other-peer", ID => {

            console.log("Other peer: " + ID);
            document.querySelector("#description").innerHTML = `Connection created with peer ${ID}`
            setOnlinePointerColor("green")

        })

        socket.on("room-full", message => {

            console.log(message);

        })


    }

    const callPeer = (event) => {


        event.preventDefault()

        setCallButtonIsDisabled(true)
        setHangupIsDisabled(false)

        var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        getUserMedia({ video: true, audio: true }, function (stream) {
            localStream.current.srcObject = stream
            var call = peerRef.current.call(remotePeer.current, stream);
            connRef.current = call
            console.log("clicked");
            call.on('stream', function (stream) {
                remoteStream.current.srcObject = stream
                console.log(stream);
            });
            call.on('close', function () {
                console.log("disconnected");
                stream.getTracks().forEach(function (track) {
                    track.stop();
                });
                setCallButtonIsDisabled(false)
                setHangupIsDisabled(true)
            })

        }, function (err) {
            console.log('Failed to get local stream', err);
        });

    }

    const closeRoom = (event) => {

        event.preventDefault()

        connRef.current.close()
        localStream.current.srcObject = null


    }

    const sendFile = (event) => {

        event.preventDefault()
        const file = event.target.files[0]
        const blob = new Blob(event.target.files, { type: file.type })

        var conn = peerRef.current.connect(remotePeer.current)
        conn.send('hi')


    }


    return (
        <div className={styles.container}>
            <Head>
                <title>WebRTC stream</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <div className={styles.sidebar}>

                    <div className={styles.onlinePointer} style={{ background: onlinePointerColor }}></div>

                </div>
                <div>
                    <div className={styles.mainFrame}>
                        <div className={styles.videoFrame}>
                            <video className={styles.videoLocal} id='localStream' ref={localStream} autoPlay muted playsInline></video>
                            <video className={styles.videoRemote} id='remtoreStream' ref={remoteStream} autoPlay playsInline></video>
                        </div>
                        <div className={styles.buttonGroup}>
                            <Button className={styles.button} id="createRoom" disabled={isDisabled} onClick={(event) => createRoom(event)}>createRoom</Button>
                            <Button className={styles.button} id="joinRoom" disabled={isDisabled} onClick={(event) => joinRoom(event)}>joinRoom</Button>
                            <Button className={styles.button} id="callPeer" disabled={callButtonIsDisabled} onClick={(event) => callPeer(event)}>Call</Button>
                            <Button className={styles.button} id="closeRoom" disabled={hangupIsDisabled} onClick={(event) => closeRoom(event)}>Hangup</Button>
                            <input className='btn btn-primary' onChange={(event) => sendFile(event)} disabled={callButtonIsDisabled} type={"file"}></input>
                        </div>
                        <div className={styles.description} id="description">Create a room, or Join on to start a peer connection!</div>
                    </div>
                </div>
            </main>


        </div>
    )
}

export default Video