{
  description = "Simple Go Flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

      in
      {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            coreutils
            moreutils
            jq

            pkgs.nodePackages.prettier
            pkgs.nodePackages.typescript-language-server
            pkgs.nodejs

            go
            gopls
            gotools
            golangci-lint
            go-outline
            gopkgs
          ];
        };
      }
    );
}

