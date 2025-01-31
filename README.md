# wipeclean
[![Packaging status](https://repology.org/badge/tiny-repos/wipeclean.svg)](https://repology.org/project/wipeclean/versions)

Tired of the old and uninteresting clear command?
Do you want your error messages to be <i>slowly</i> wiped away?

Then try wipeclean!

## Install
<details>
<summary>NPM</summary>

`npm install wipeclean -g`
</details>

<details>
<summary>Aur</summary>

You can also [find it on Aur](https://aur.archlinux.org/packages/wipeclean) and install with an AUR helper like yay:
`yay -S wipeclean`

Note that the yay package is unofficial and not created by the original developer.
</details>

## Usage

to run the program just write: `wipeclean`<br>
consider setting an alias to `clean` like `echo "alias clean=wipeclean" >> ~/.bash_aliases`

![ezgif-1-e28b5aae8c](https://user-images.githubusercontent.com/60259431/155228227-a429c2ae-a003-41d0-b8de-a6fa8b7413c7.gif)

## Options

Configurable values are stored in `~/.wipeclean/config.json`.

Set the brush speed (in frames per second):<br>
`wipeclean -s <speed>`<br>
`wipeclean --speed <speed>`
