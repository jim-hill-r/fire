{ pkgs ? import <nixpkgs> {}}:
pkgs.mkShell {
    name="gumby";
    buildInputs = [
        pkgs.git
        pkgs.nodejs
    ];
    shellHook = ''
        echo "Welcome to Gumby development!"
    '';
}