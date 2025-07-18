{
  description = "Development environment for this project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } ({ lib, ... }: {
      systems = lib.systems.flakeExposed;
      perSystem = { system, ... }: let
        pkgs = import inputs.nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
            android_sdk.accept_license = true;
          };
        };
      in {
        packages.default = let
          androidComposition = pkgs.androidenv.composeAndroidPackages {
            platformVersions = [ "35" ];
            buildToolsVersions = [ "34.0.0" "35.0.0" ];
            includeEmulator = false;
            includeSystemImages = false;
            includeNDK = false;
          };
        in pkgs.mkShell {
          packages = with pkgs; [
            bashInteractive
            nodejs
            jdk21
            
            # Android SDK
            androidComposition.androidsdk
            android-tools
          ];
          
          shellHook = ''
            # Create local SDK directory
            ANDROID_SDK_ROOT="$PWD/.android-sdk";
            ANDROID_HOME="$PWD/.android-sdk";
            export ANDROID_SDK_ROOT ANDROID_HOME
            
            mkdir -p $ANDROID_SDK_ROOT
            
            # Set up SDK with symlinks if not already done
            if [ ! -d "$ANDROID_SDK_ROOT/platforms" ]; then
              echo "Setting up Android SDK in $ANDROID_SDK_ROOT..."
              
              # Create symlinks to SDK components
              for item in ${androidComposition.androidsdk}/libexec/android-sdk/*; do
                ln -sfn "$item" "$ANDROID_SDK_ROOT/$(basename "$item")"
              done
              
              # Create licenses directory and accept licenses
              mkdir -p $ANDROID_SDK_ROOT/licenses
              echo "8933bad161af4178b1185d1a37fbf41ea5269c55" > $ANDROID_SDK_ROOT/licenses/android-sdk-license
              echo "d56f5187479451eabf01fb78af6dfcb131a6481e" >> $ANDROID_SDK_ROOT/licenses/android-sdk-license
              echo "24333f8a63b6825ea9c5514f83c2829b004d1fee" >> $ANDROID_SDK_ROOT/licenses/android-sdk-license
              echo "84831b9409646a918e30573bab4c9c91346d8abd" > $ANDROID_SDK_ROOT/licenses/android-sdk-preview-license
              echo "601085b94cd77f0b54ff86406957099ebe79c4d6" > $ANDROID_SDK_ROOT/licenses/android-googletv-license
              echo "33b6a2b64607f11b759f320ef9dff4ae5c47d97a" > $ANDROID_SDK_ROOT/licenses/google-gdk-license
              echo "e9acab5b5fbb560a72cfaecce8946896ff6aab9d" > $ANDROID_SDK_ROOT/licenses/mips-android-sysimage-license
            fi
            
            # Set up local.properties for the project
            if [ -d "android" ]; then
              echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties
              echo "Created android/local.properties with SDK path"
            fi
            
            echo "Android development environment loaded!"
            echo "ANDROID_HOME: $ANDROID_HOME"
            echo "ANDROID_SDK_ROOT: $ANDROID_SDK_ROOT"
          '';
        };
      };
    });
}
