INTERNAL_LIB=$1
DECO_VERSION=$2

if [ $USER = "root" ]; then
  echo $USER
  exit 1
fi

rm -rf ~/Library/Application\ Support/com.decosoftware.Deco/libs
mkdir -p ~/Library/Application\ Support/com.decosoftware.Deco/libs

cp -r "$INTERNAL_LIB/Project" ~/Library/Application\ Support/com.decosoftware.Deco/libs
cp -r "$INTERNAL_LIB/modules.tar.bz2" ~/Library/Application\ Support/com.decosoftware.Deco/libs

chown -R $USER:staff ~/Library/Application\ Support/com.decosoftware.Deco
chmod -R 755 ~/Library/Application\ Support/com.decosoftware.Deco

OLD_PROJ_DIR=~/.Deco/tmp/Project
if [ -d "$OLD_PROJ_DIR" ]; then
  chmod -R 755 ~/.Deco
  chown -R $USER:staff ~/.Deco
  rm -rf ~/.Deco/tmp/Project
fi

HOME_DIR=~/.Deco/tmp
if [ -d "$HOME_DIR" ]; then
  rm -rf ~/.Deco/tmp
fi

pushd ~/Library/Application\ Support/com.decosoftware.Deco/libs/Project
cp ../modules.tar.bz2 ./
tar -xf ./modules.tar.bz2
rm ./modules.tar.bz2
popd

mkdir -p ~/.Deco/tmp
cp -af ~/Library/Application\ Support/com.decosoftware.Deco/libs/Project ~/.Deco/tmp/.template.Project
chmod -R 755 ~/.Deco
chown -R $USER:staff ~/.Deco

DECO_VERSION_FILE=~/Library/Application\ Support/com.decosoftware.Deco/.deco.version
if [ -f "$DECO_VERSION_FILE" ]; then
  rm -f "$DECO_VERSION_FILE"
fi
printf $DECO_VERSION >> "$DECO_VERSION_FILE"
chmod -R 755 "$DECO_VERSION_FILE"
chown -R $USER:staff "$DECO_VERSION_FILE"

exit
