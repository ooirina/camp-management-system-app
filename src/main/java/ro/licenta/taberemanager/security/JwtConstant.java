package ro.licenta.taberemanager.security;

public class JwtConstant {
    public static final String SECRET_KEY="wpembytrwcvnryxksdbqwjebruyGHyudqgwveytrtrCSnwifoesarjbwe";
   /// durata de  viata a unui token(24h)
    public static final long  EXPIRATION_TIME=8640000;
   //nume header pe cae il va folosi React
    public static final String JWT_HEADER="Authorization";
}
