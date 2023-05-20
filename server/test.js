const input = `Emin                                    	Ahmetovic
Valery	Aldebot Ho
Victoria                                	Allen
Brittany                                	Almanza
Dylan	Anderson
Madeleine	Anderson - Salo
James	Andrews
Kayla                                   	Antonucci
Ashley                                  	Aquilar
Julie	Armtrong
Sydney	Atlas
Lea                                     	Baum
Jacob                                   	Beauding
Ryan                                    	Belanger
Sepehr	Belar
Timothy	Berard
Mitchell	Berry
Gavin	Bibeau
Joseph                                  	Bigos
Christianna	Bittarelli
Bailey                                  	Bochicchio
Logan                                   	Boisvert
Paige                                   	Borromeo
Cove                                    	Boucher
Ariana	Boudreau
Caroline                                	Boudreau
Abigail                                 	Boya
Quinn 	Briggs
Peter	Brown
Delainie	Bullis
Joseph                                  	Bunaskavich
Diego	Burgos Rodriguez
Diego	Burgos Rodriguez
Isaiah	Burton
Levi                                    	Bushey
Brandon	Camp
Coleen                                  	Campbell
Maya                                    	Caple
Anna	Carbone
Camryn	Carlson
Kyle                                    	Case
Paige                                   	Castell
Andrew	Chace
Hannah                                  	Champagne
Jonnie	Charest
Ilana	Chasin
Anh	Che
Jordyn                                  	Choate
Alexis	Chrissanthis
Sierra                                  	Clark - Godin
Casey	Coles
Lauren                                  	Conti
Tyler                                   	Cormier
Kyle	Cotoia
Malorie                                 	Crumpler
MacKenzie                               	Curry
Michael                                 	Decesare
Brooke                                  	Deily
Alexis                                  	Delucia
Isadora	DeMiranda
Meredith	DeNegris
Ronan                                   	DePaul
Sydnie                                  	DeVries
Eyleen	Dias
Riley	Diemer
Joshua                                  	DiNapoli
Hannah                                  	Dobecki
Calen                                   	Douglas
Olivia	Drake
Brooke	Drouin
Gabriela                                	Duana
Melanie	Dube
Kameron                                 	Dubois
Nathan                                  	Duval
Matthew	Eagan
Sydney                                  	Eccleston
Ryan                                    	Eddy
Sarah	Evans
Angelina 	Filatova
Joshua                                  	Fisher
Matthew                                 	Fisher
Grace	Frink
Kyle	Furey
Olivia	Gage
Molly	Gagne
Matthew                                 	Gagnon
Alexis	Garon - Gaffney
Ashley                                  	Geraghty
Meghan	Gordon
Faith	Gormley
Derrick	Grant
Ava	Gravell
Emily	Greenwood
Matthew                                 	Handley
Lucas	Hanson
Rachael	Harris
Elizabeth                               	Heffernan
McKenzie	Hoyt
Matthew	Hross
Noah	Huizenga
Abigale                                 	Hurd
Anaya	Jacques - Simon
Zahra	Jafri
Felicia	Johns
Spencer	Kalafus
Jordan                                  	Kanaley
Nathaniel                               	Kaplan
Jason                                   	Kelly
McKayla                                 	Kelly
Jack                                    	Kephart
Noah                                    	Kirby
Ariana	Koivisto
Kenneth	Koranteng
Konrad	Koranteng
Tarik                                   	Krestalica
Kathleen	Landry
Abigail	Landry
Kayla                                   	Larkin-Goldman
James	Leary
Andrew                                  	Lehmann
Parker	Lendrum
Madailein	Lindsay
Andrea	Lisciotto
Elijah	Lockhart
Whitney                                 	Love
Shannon                                 	Luby
McKenzie                                	Lyne
Linh	Mai
Savannah	Maloughney
Codey	Martioski
Abigail	Mason
Lindsay	Mcalpine
Olivia                                  	McCarthy
Kerry	McNally
Kassidy                                 	Michael
Devin	Miles
Amelia                                  	Miller
Ariana                                  	Miller
Ester                                   	Mills
Margaret                                	Mitchell
Hannah	Muller
Daniel	Murphy
Jacob                                   	Myers
Yin Lok                                 	Ng
Shay	Ohanley
Darvin	Ojha
Ethan	Okwuosa
Maeghan	Oneail
Aaliyah	Ortiz
Dylan                                   	O'Sullivan
Isaac	Ouellette
Ainsley	Owens
Shubham	Oza
MacKenzie                               	Parker
Andreya                                 	Pastor
Justin                                  	Perkins
Skylar                                  	Pietz
Sydney                                  	Pollard
Nisham	Prasai
Jessica                                 	Pueschel
Morgan	Pysher
Katelyn                                 	Rand
Hannah                                  	Reid
Paige	Rivera
Hannah	Robitaille
Raina	Rosenberg
Victoria	Roulston
Dulce                                   	Sandoval Leon
Emily	Sanschagrin
Madison	Schofield
Allison                                 	Segal
Tatum                                   	Shaw
Liam	Shelton
Marisa                                  	Shiland
Silvonna	Silvestre
Alyssa	Simard
Anthony	Sindoni
James                                   	Small
Cohen	Smith
Griffin	Speidel
Owen                                    	Stocker
Judiah                                  	Strouse
Nolan	Sykes
Brendan	Taylor
Ayya	Tber
Nicholas                                	Teixeira
Preston	Thavone
Mikayla                                 	Thompson
Brianna                                 	Tilton
Leticia	Toledo
Keyla	Torres
Nya                                     	Trudelle
Joseph                                  	Tsepas
Olivia                                  	Twitchell
Olukpe                                  	Viakinnou
Yona	Voss-Andreae
Abigail                                 	Ward
Megan	Wessner
Haley                                   	Wheeler
Isabella                                	White
Jeffrey	Willingham
Andrew	Wilson
Luke	Zelis`

function containsUppercase(str) {
  return /[A-Z]/.test(str);
}

function containsLowercase(str) {
  return /[a-z]/.test(str) || str === '-'
}

const names = input.split(`\n`)

const fs = require('fs')

fs.writeFileSync('./excelOutputs.txt', names.map(name => {
  let newName = " "
  name.split('').forEach(letter => {
    if (containsUppercase(letter)) {
      if (newName[newName.length - 1] !== "-") {
        newName += " "
      }
      newName += letter
    } else if (containsLowercase(letter)) {
      newName += letter
    }
  })
  return newName.trim()
}).join("\n"))
