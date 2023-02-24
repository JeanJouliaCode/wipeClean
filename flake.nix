{
  description = "wipeClean for Nix";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    gitignore = {
      url = "github:hercules-ci/gitignore.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    dream2nix.url = "github:nix-community/dream2nix";
  };
  outputs = { self, nixpkgs, flake-utils, gitignore, dream2nix, ... }:
    # Note: no need for flake-utils.lib.eachDefaultSystem, dream2nix does it for us
    dream2nix.lib.makeFlakeOutputs {
      systems = flake-utils.lib.defaultSystems;
      config.projectRoot = ./.;
      projects = ./projects.toml;
      source = gitignore.lib.gitignoreSource ./.;
    };
}
