import {Player} from "@/players/PlayerBase";
import PlayerFactory from "youtube-player";
import PlayerStates from "youtube-player/dist/constants/PlayerStates";
import { YouTubePlayer } from "youtube-player/dist/types";

export class YoutubeMusicPlayer extends Player {
    p: YouTubePlayer
    Playing: boolean
    Volume: number

    constructor(url: string) {
        super(url);

        const main = document.getElementsByTagName("main")[0];
        const container = document.createElement("div");
        container.classList.add("hidden");

        const iframe = document.createElement("div");
        iframe.id = "video-player";
        iframe.className = "hidden";
        container.appendChild(iframe);

        main.appendChild(container);

        window.setInterval(()=>{
            this.p.getPlayerState().then((state)=>{
                this.Playing = (state == 1);
            });
        }, 100);

        var videoURL = url;
        var splited = videoURL.split("v=");
        var splitedAgain = splited[1].split("&");
        var videoId = splitedAgain[0]; 

        this.p = PlayerFactory("video-player", {
            videoId: videoId
        });
        this.p.setSize(0, 0);

        console.log("Youtube ID is : %s", videoId);

        this.Volume = 50
        this.p.setVolume(this.Volume)
    }

    override PlayMusicUntilEnd(started_callback: () => void | null, finished_callback: () => void | null): void
    {
        if(started_callback != null) started_callback();
        this.p.playVideo();
    }

    override PlayMusic(timer: number, started_callback: () => void | null, finished_callback: () => void | null): void
    {
        let l;

        this.p.seekTo(0, true);
        let onPlay = (event)=>{
            if(event.data == PlayerStates.PLAYING){
                if(started_callback != null) started_callback();
                window.setTimeout(()=>{
                    this.p.getPlayerState().then((state)=>{
                        if(!(state == 2)){
                            this.StopMusic();
                            if(finished_callback != null)finished_callback();
                        }
                    });
                }, timer*1000);
                
                this.p.off(l);
            }
        }

        l = this.p.on("stateChange", onPlay);

        this.p.playVideo();

    }

    override StopMusic(): void
    {
        this.p.pauseVideo();
        this.p.seekTo(0, true);
    }

    override async GetCurrentMusicTime(callback: (percentage: number)=>void)
    {
        if(!this.Playing) callback(0);

        this.p.getCurrentTime().then((n)=>{
            callback(n*1000);
        })
    }

    override async GetCurrentMusicLength(callback: (length: number)=>void)
    {
        this.p.getDuration().then((n)=>{
            console.log("Length is : %d", n)
            callback(n*1000);
        })
    }

    override GetVolume(): number {
        return this.Volume;
    }

    override SetVolume(volume: number): void {
        this.Volume = volume
        this.p.setVolume(this.Volume)
    }
}